import http from "node:http";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RoomError,
  closeDatabaseRoom,
  createDatabaseRoom,
  appendDatabaseGameEvent,
  appendDatabaseRoomMessage,
  blockDatabaseRoomUser,
  reportDatabaseRoomMessage,
  databaseEnabled,
  databaseHealth,
  deleteDatabaseUser,
  getDatabaseRoom,
  getDatabaseRoomMessages,
  getDatabaseRoomSession,
  getDatabaseRoomVoiceSignals,
  appendDatabaseRoomVoiceSignal,
  setDatabaseRoomReady,
  setDatabaseRoomRole,
  joinDatabaseRoom,
  leaveDatabaseRoom,
  listDatabaseRooms,
  listDatabaseScripts,
  saveDatabaseScript,
  startDatabaseRoom
} from "./db/store.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const scriptsDir = path.join(root, "data", "scripts");
const incomingDir = path.join(root, "incoming");
const port = Number(process.env.PORT || 4173);
const isVercel = process.env.VERCEL === "1";
const corsOrigins = new Set((process.env.CORS_ORIGINS || "http://localhost:4173,http://localhost,capacitor://localhost").split(",").map((origin) => origin.trim()).filter(Boolean));
const syncState = {
  running: false,
  imported: 0,
  lastSync: null,
  lastFile: null,
  lastError: null
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml"
};

if (!isVercel) {
  await Promise.all([
    fs.mkdir(scriptsDir, { recursive: true }),
    fs.mkdir(incomingDir, { recursive: true })
  ]);
}

function slugify(input) {
  return String(input || "script")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || `script-${Date.now()}`;
}

function normalizeScript(raw, filename = "script.json") {
  const title = raw.title || raw.name || path.basename(filename, path.extname(filename));
  const players = Number(raw.players || raw.playerCount || 6);
  return {
    id: raw.id || `${slugify(title)}-${Date.now().toString(36)}`,
    title,
    subtitle: raw.subtitle || "一场关于真相、秘密与选择的沉浸式推理",
    genre: raw.genre || "现代 · 叙事推理",
    players,
    duration: raw.duration || "60–90 分钟",
    difficulty: raw.difficulty || "进阶",
    tags: Array.isArray(raw.tags) ? raw.tags : ["沉浸推理", "多人房间"],
    author: raw.author || "Nocturne Studio",
    cover: raw.cover || ["violet", "amber", "blue", "rose"][Math.floor(Math.random() * 4)],
    description: raw.description || "一份新剧本已经抵达。请在所有人说出真话之前，找到唯一无法被伪造的证据。",
    status: raw.status || "可开局",
    content: raw.content || {
      opening: "夜色落在城市边缘，所有人都带着一段不能被说出的过去。",
      chapters: ["序章 · 入场", "第一幕 · 私密线索", "第二幕 · 公开质询", "终局 · 投票与复盘"]
    },
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

async function listScripts() {
  if (databaseEnabled) {
    try {
      const scripts = await listDatabaseScripts();
      if (scripts) return scripts;
    } catch (error) {
      syncState.lastError = `database read failed: ${error.message}`;
    }
  }
  const files = (await fs.readdir(scriptsDir)).filter((file) => file.endsWith(".json"));
  const scripts = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(scriptsDir, file), "utf8"));
      scripts.push(normalizeScript(raw, file));
    } catch (error) {
      syncState.lastError = `${file}: ${error.message}`;
    }
  }
  return scripts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function saveScript(raw, filename = "script.json") {
  const script = normalizeScript(raw, filename);
  if (databaseEnabled) {
    const saved = await saveDatabaseScript(script, filename);
    syncState.imported += 1;
    syncState.lastSync = new Date().toISOString();
    syncState.lastFile = filename;
    syncState.lastError = null;
    return saved;
  }
  if (isVercel) throw new Error("Script import requires DATABASE_URL to be configured for the API service.");
  const safeName = `${slugify(script.title)}.json`;
  await fs.writeFile(path.join(scriptsDir, safeName), `${JSON.stringify(script, null, 2)}\n`);
  syncState.imported += 1;
  syncState.lastSync = new Date().toISOString();
  syncState.lastFile = safeName;
  syncState.lastError = null;
  return script;
}

async function parseIncoming(file) {
  const fullPath = path.join(incomingDir, file);
  const extension = path.extname(file).toLowerCase();
  const content = await fs.readFile(fullPath, "utf8");
  if (extension === ".json") return JSON.parse(content);
  if (extension === ".md") {
    const lines = content.split(/\r?\n/);
    const title = (lines.find((line) => /^#\s+/.test(line)) || "# 未命名剧本").replace(/^#\s+/, "").trim();
    const description = lines.filter((line) => line.trim() && !line.startsWith("#")).slice(0, 3).join(" ");
    return { title, description, content: { markdown: content } };
  }
  return null;
}

async function scanIncoming() {
  if (syncState.running) return;
  syncState.running = true;
  try {
    const files = await fs.readdir(incomingDir);
    for (const file of files) {
      if (file.startsWith(".processed-") || file.toLowerCase() === "readme.md" || !/\.(json|md)$/i.test(file)) continue;
      try {
        const raw = await parseIncoming(file);
        if (raw) await saveScript(raw, file);
        await fs.rename(path.join(incomingDir, file), path.join(incomingDir, `.processed-${Date.now()}-${file}`));
      } catch (error) {
        syncState.lastError = `${file}: ${error.message}`;
      }
    }
  } finally {
    syncState.running = false;
  }
}

if (!isVercel) {
  try {
    const watcher = fsSync.watch(incomingDir, { persistent: false }, () => scanIncoming());
    watcher.on("error", (error) => {
      syncState.lastError = `native watcher unavailable; using interval scan (${error.code || "unknown"})`;
      watcher.close();
    });
  } catch (error) {
    // Some managed environments cap native file watchers. The interval below
    // keeps automatic ingestion available without requiring a watcher handle.
    syncState.lastError = `native watcher unavailable; using interval scan (${error.code || "unknown"})`;
  }
  setInterval(scanIncoming, 4000).unref();
}
if (!isVercel) await scanIncoming();

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2_000_000) throw new Error("request body too large");
  }
  return body;
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  try {
    const origin = request.headers.origin;
    if (origin && corsOrigins.has(origin)) {
      response.setHeader("access-control-allow-origin", origin);
      response.setHeader("vary", "Origin");
      response.setHeader("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
      response.setHeader("access-control-allow-headers", "content-type");
    }
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      return response.end();
    }
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === "/api/scripts" && request.method === "GET") {
      return sendJson(response, 200, { scripts: await listScripts() });
    }
    if (url.pathname === "/api/sync" && request.method === "GET") {
      const scripts = await listScripts();
      return sendJson(response, 200, { ...syncState, total: scripts.length, database: databaseEnabled });
    }
    if (url.pathname === "/api/health" && request.method === "GET") {
      return sendJson(response, 200, { ok: true, ...(await databaseHealth()) });
    }
    if (url.pathname === "/api/profile" && request.method === "DELETE") {
      const payload = JSON.parse(await readBody(request));
      const result = await deleteDatabaseUser(payload.user || payload.profile || {});
      return sendJson(response, 200, result || { deleted: false });
    }
    if (url.pathname === "/api/rooms" && request.method === "GET") {
      return sendJson(response, 200, { rooms: (await listDatabaseRooms(url.searchParams.get("status") || "waiting")) || [], database: databaseEnabled });
    }
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Rooms require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const room = await createDatabaseRoom(payload.scriptId || payload.script_id, payload.user || payload.profile, payload.maxPlayers);
      return sendJson(response, 201, { room });
    }
    const roomAction = url.pathname.match(/^\/api\/rooms\/([^/]+)\/(join|leave|start|close|ready|role)$/);
    if (roomAction && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Rooms require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const roomId = decodeURIComponent(roomAction[1]);
      const action = roomAction[2];
      const user = payload.user || payload.profile || {};
      const room = action === "join"
        ? await joinDatabaseRoom(roomId, user, payload.memberRole === "spectator" ? "spectator" : "player")
        : action === "leave" ? await leaveDatabaseRoom(roomId, user)
          : action === "close" ? await closeDatabaseRoom(roomId, user)
            : action === "ready" ? await setDatabaseRoomReady(roomId, user, payload.ready !== false)
              : action === "role" ? await setDatabaseRoomRole(roomId, user, payload.characterKey)
              : await startDatabaseRoom(roomId, user);
      return sendJson(response, 200, { room });
    }
    const roomMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
    const roomMessagesMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/messages$/);
    const roomVoiceSignalsMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/voice\/signals$/);
    const roomMessageReportMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/messages\/(\d+)\/report$/);
    const roomUserBlockMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/users\/([^/]+)\/block$/);
    const roomSessionMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/session$/);
    if (roomVoiceSignalsMatch && request.method === "GET") {
      if (!databaseEnabled) return sendJson(response, 404, { error: "Room voice signals not found" });
      const profile = {
        externalKey: url.searchParams.get("externalKey") || "",
        displayName: url.searchParams.get("displayName") || "Night Watcher",
        locale: url.searchParams.get("locale") || "en"
      };
      const signals = await getDatabaseRoomVoiceSignals(decodeURIComponent(roomVoiceSignalsMatch[1]), profile, url.searchParams.get("since"));
      return sendJson(response, 200, signals);
    }
    if (roomVoiceSignalsMatch && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Room voice signals require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const signal = await appendDatabaseRoomVoiceSignal(
        decodeURIComponent(roomVoiceSignalsMatch[1]),
        payload.user || payload.profile,
        payload.receiverUserId || payload.toUserId,
        payload.signalType || payload.type,
        payload.payload || {}
      );
      return sendJson(response, 201, { signal });
    }
    if (roomMessageReportMatch && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Message reports require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const report = await reportDatabaseRoomMessage(
        decodeURIComponent(roomMessageReportMatch[1]),
        roomMessageReportMatch[2],
        payload.user || payload.profile,
        payload.reason
      );
      return sendJson(response, 201, report);
    }
    if (roomUserBlockMatch && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "User blocks require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const result = await blockDatabaseRoomUser(
        decodeURIComponent(roomUserBlockMatch[1]),
        payload.user || payload.profile,
        decodeURIComponent(roomUserBlockMatch[2])
      );
      return sendJson(response, 201, result);
    }
    if (roomMessagesMatch && request.method === "GET") {
      if (!databaseEnabled) return sendJson(response, 404, { error: "Room messages not found" });
      const profile = {
        externalKey: url.searchParams.get("externalKey") || "",
        displayName: url.searchParams.get("displayName") || "Night Watcher",
        locale: url.searchParams.get("locale") || "en"
      };
      const messages = await getDatabaseRoomMessages(decodeURIComponent(roomMessagesMatch[1]), profile, url.searchParams.get("since"));
      return sendJson(response, 200, messages);
    }
    if (roomMessagesMatch && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Room messages require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const message = await appendDatabaseRoomMessage(
        decodeURIComponent(roomMessagesMatch[1]),
        payload.user || payload.profile,
        payload.body || payload.message
      );
      return sendJson(response, 201, message);
    }
    if (roomSessionMatch && request.method === "GET") {
      if (!databaseEnabled) return sendJson(response, 404, { error: "Room session not found" });
      const profile = {
        externalKey: url.searchParams.get("externalKey") || "",
        displayName: url.searchParams.get("displayName") || "Night Watcher",
        locale: url.searchParams.get("locale") || "en"
      };
      const session = await getDatabaseRoomSession(decodeURIComponent(roomSessionMatch[1]), profile, url.searchParams.get("since"));
      return sendJson(response, 200, session);
    }
    const roomEventMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/session\/events$/);
    if (roomEventMatch && request.method === "POST") {
      if (!databaseEnabled) return sendJson(response, 503, { error: "Room sessions require DATABASE_URL to be configured." });
      const payload = JSON.parse(await readBody(request));
      const event = await appendDatabaseGameEvent(
        decodeURIComponent(roomEventMatch[1]),
        payload.user || payload.profile,
        payload.eventType || payload.type,
        payload.payload || {}
      );
      return sendJson(response, 201, event);
    }
    if (roomMatch && request.method === "GET") {
      if (!databaseEnabled) return sendJson(response, 404, { error: "Room not found" });
      const room = await getDatabaseRoom(decodeURIComponent(roomMatch[1]), { externalKey: url.searchParams.get("externalKey") || "" });
      return room ? sendJson(response, 200, { room }) : sendJson(response, 404, { error: "Room not found" });
    }
    if (url.pathname === "/api/locale" && request.method === "GET") {
      // Use a country code supplied by the trusted deployment edge. The app
      // never needs to send a visitor IP to a separate geolocation vendor.
      const countryCode = ["cf-ipcountry", "x-vercel-ip-country", "x-country-code"]
        .map((header) => String(request.headers[header] || "").trim().toUpperCase())
        .find((value) => /^[A-Z]{2}$/.test(value)) || null;
      return sendJson(response, 200, { country_code: countryCode, source: countryCode ? "edge-header" : "browser-fallback" });
    }
    if (url.pathname === "/api/scripts/import" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const script = await saveScript(payload.script || payload, payload.filename || "uploaded.json");
      return sendJson(response, 201, { script });
    }
    if (url.pathname === "/api/scripts/scan" && request.method === "POST") {
      if (isVercel) return sendJson(response, 200, { ...syncState, scripts: await listScripts(), readOnly: true });
      await scanIncoming();
      return sendJson(response, 200, { ...syncState, scripts: await listScripts() });
    }
    if (url.pathname.startsWith("/api/")) return sendJson(response, 404, { error: "not found" });

    const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = path.normalize(path.join(publicDir, requested));
    if (!filePath.startsWith(publicDir)) return sendJson(response, 403, { error: "forbidden" });
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error("not a file");
    response.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    response.end(await fs.readFile(filePath));
  } catch (error) {
    const roomStatus = {
      ROOM_NOT_FOUND: 404,
      SCRIPT_NOT_FOUND: 404,
      ROOM_FULL: 409,
      ROOM_CLOSED: 409,
      ROOM_LIVE: 409,
      ROOM_NOT_READY: 409,
      NOT_HOST: 403,
      NOT_MEMBER: 403,
      SESSION_NOT_FOUND: 409,
      INVALID_EVENT: 400,
      EMPTY_MESSAGE: 400,
      INVALID_VOICE_SIGNAL: 400,
      ROLE_NOT_FOUND: 404,
      ROLE_TAKEN: 409,
      REPORT_NOT_FOUND: 404,
      REPORT_DUPLICATE: 409,
      INVALID_BLOCK: 400,
      BLOCK_NOT_FOUND: 404
    }[error.code];
    const status = roomStatus || (error.code === "ENOENT" ? 404 : 500);
    sendJson(response, status, { error: status === 404 && !roomStatus ? "not found" : error.message, code: error.code });
  }
});

server.listen(port, () => {
  console.log(`Nocturne is running at http://localhost:${port}`);
  console.log(`Drop .json or .md scripts into ${incomingDir} for automatic ingestion.`);
});
