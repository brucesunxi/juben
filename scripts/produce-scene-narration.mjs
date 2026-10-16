import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { buildSceneNarration } from "./build-scene-narration.mjs";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const base = process.env.NARRATION_API_BASE || "https://juben-lyart.vercel.app";
// Credentials stay in memory: supply via environment or a no-echo stdin pipe.
const token = process.env.ADMIN_REVIEW_TOKEN || await new Promise((resolve) => process.stdin.once("data", (data) => resolve(String(data).trim())));
if (!token) throw new Error("An admin credential is required");
const catalog = buildSceneNarration();
const roles = {};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let completed = 0;

async function request(url, options) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${base}${url}`, { ...options, signal: AbortSignal.timeout(60000) });
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await pause(5000 * (attempt + 1));
      continue;
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(`Request failed: ${response.status} ${data.code || ""} ${url}`);
  }
}

async function download(asset, relativePath) {
  const response = await request(asset.audioUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.headers.get("content-type")?.includes("audio/") || buffer.length < 1000) throw new Error(`Invalid audio ${asset.id}`);
  const file = path.join(root, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buffer);
}

for (const [scriptId, locales] of Object.entries(catalog)) {
  roles[scriptId] = {};
  for (const [locale, scenes] of Object.entries(locales)) {
    let { assets } = await (await request(`/api/scripts/${scriptId}/audio?locale=${locale}`)).json();
    for (const [phase, scene] of Object.entries(scenes)) {
      let asset = assets.find((item) => item.kind === "host" && item.sceneKey === scene.sceneKey && item.text === scene.text && item.audioUrl);
      if (!asset) {
        await request(`/api/admin/scripts/${scriptId}/audio/generate`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-admin-token": token },
          body: JSON.stringify({ asset: { locale, kind: "host", speakerKey: "host", sceneKey: scene.sceneKey, text: scene.text, voiceName: locale === "zh" ? "zh-CN-YunjianNeural" : "en-US-GuyNeural", status: "ready" }, displayName: "Scene Narration Producer", locale })
        });
        ({ assets } = await (await request(`/api/scripts/${scriptId}/audio?locale=${locale}`)).json());
        asset = assets.find((item) => item.kind === "host" && item.sceneKey === scene.sceneKey && item.audioUrl);
        // Azure's free tier has a small synthesis request allowance per minute.
        await pause(3500);
      }
      if (!asset) throw new Error(`Generated asset missing: ${scriptId}/${locale}/${phase}`);
      await download(asset, scene.audioUrl);
      console.log(`${++completed}/40 ${scriptId} ${locale} ${phase}`);
    }
    roles[scriptId][locale] = {};
    for (const asset of assets.filter((item) => item.kind === "role" && item.sceneKey === "briefing" && item.audioUrl)) {
      const hash = createHash("sha256").update(`${asset.id}:${asset.text}`).digest("hex").slice(0, 12);
      const audioUrl = `assets/narration/${scriptId}/${locale}-role-${asset.speakerKey}-${hash}.mp3`;
      await download(asset, audioUrl);
      roles[scriptId][locale][asset.speakerKey] = { audioUrl, text: asset.text, voiceName: asset.voiceName };
    }
  }
}
await fs.writeFile(path.join(root, "role-narration.js"), `// Published character monologues bundled for reliable playback.\nwindow.NOCTURNE_ROLE_NARRATION = ${JSON.stringify(roles, null, 2)};\n`);
console.log("Scene narration and existing character monologues bundled successfully.");
process.exit(0);
