import pg from "pg";
import crypto from "node:crypto";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
export const databaseEnabled = Boolean(connectionString);
const pool = databaseEnabled
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

const databaseShapeReady = databaseEnabled
  ? pool.query("ALTER TABLE game_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL")
    .then(() => pool.query("ALTER TABLE room_members ADD COLUMN IF NOT EXISTS character_key TEXT"))
    .then(() => pool.query("ALTER TABLE room_members ADD COLUMN IF NOT EXISTS ready BOOLEAN NOT NULL DEFAULT FALSE"))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS room_messages (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS room_messages_room_idx ON room_messages (room_id, id)"))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS room_voice_signals (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      sender_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      receiver_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      signal_type TEXT NOT NULL CHECK (signal_type IN ('hello', 'offer', 'answer', 'candidate', 'leave')),
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS room_voice_signals_receiver_idx ON room_voice_signals (room_id, receiver_user_id, id)"))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS room_message_reports (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      message_id BIGINT NOT NULL REFERENCES room_messages(id) ON DELETE CASCADE,
      reporter_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL DEFAULT 'other' CHECK (char_length(reason) BETWEEN 1 AND 120),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (message_id, reporter_user_id)
    )`))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS room_message_reports_status_idx ON room_message_reports (status, created_at DESC)"))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS user_blocks (
      blocker_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      blocked_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (blocker_user_id, blocked_user_id),
      CHECK (blocker_user_id <> blocked_user_id)
    )`))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON user_blocks (blocked_user_id)"))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS player_progress (
      user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
      played INTEGER NOT NULL DEFAULT 0 CHECK (played >= 0),
      solved INTEGER NOT NULL DEFAULT 0 CHECK (solved >= 0),
      clues INTEGER NOT NULL DEFAULT 0 CHECK (clues >= 0),
      questions INTEGER NOT NULL DEFAULT 0 CHECK (questions >= 0),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`))
    .then(() => pool.query(`CREATE TABLE IF NOT EXISTS player_completions (
      user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      completion_key TEXT NOT NULL,
      script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE RESTRICT,
      room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
      solved BOOLEAN NOT NULL DEFAULT FALSE,
      clues INTEGER NOT NULL DEFAULT 0 CHECK (clues >= 0),
      questions INTEGER NOT NULL DEFAULT 0 CHECK (questions >= 0),
      completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, completion_key)
    )`))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS player_progress_rank_idx ON player_progress (solved DESC, played DESC, updated_at ASC)"))
    .then(() => pool.query("CREATE INDEX IF NOT EXISTS player_completions_script_idx ON player_completions (script_id, completed_at DESC)"))
  : Promise.resolve();

async function waitForDatabaseShape() {
  await databaseShapeReady;
}

function durationLabel(minutes) {
  return minutes ? `${minutes} min` : null;
}

const rolePools = {
  "moon-trial": ["player", "shen", "gu", "he", "su", "luo"],
  "last-letter": ["player", "ye", "tang", "jiang", "wan", "qiao"],
  "old-port-letter": ["player", "ye", "tang", "jiang", "wan", "qiao"],
  "orbit-7": ["player", "mu", "qiao", "rui", "yan", "lin"],
  "velvet-room": ["player", "yin", "bo", "xue", "qi", "meng"]
};

function roomRolePool(scriptId) {
  return rolePools[scriptId] || rolePools["moon-trial"];
}

function rowToScript(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    genre: row.genre,
    players: row.player_count,
    duration: durationLabel(row.duration_minutes),
    difficulty: row.difficulty,
    tags: row.tags || [],
    author: row.author,
    cover: row.cover,
    description: row.description,
    status: row.status,
    content: row.content || {},
    i18n: row.i18n || {},
    sourceFilename: row.source_filename,
    published: row.published,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at
  };
}

export async function listDatabaseScripts() {
  if (!pool) return null;
  const result = await pool.query(`
    SELECT id, title, subtitle, genre, player_count, duration_minutes, difficulty,
           tags, author, cover, description, status, content, i18n, source_filename,
           published, updated_at
      FROM scripts
     WHERE published = TRUE
     ORDER BY updated_at DESC
  `);
  return result.rows.map(rowToScript);
}

export async function saveDatabaseScript(script, filename) {
  if (!pool) return null;
  const result = await pool.query(
    `INSERT INTO scripts (
      id, title, subtitle, genre, player_count, duration_minutes, difficulty,
      tags, author, cover, description, status, content, i18n, source_filename, published
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, TRUE)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      genre = EXCLUDED.genre,
      player_count = EXCLUDED.player_count,
      duration_minutes = EXCLUDED.duration_minutes,
      difficulty = EXCLUDED.difficulty,
      tags = EXCLUDED.tags,
      author = EXCLUDED.author,
      cover = EXCLUDED.cover,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      content = EXCLUDED.content,
      i18n = EXCLUDED.i18n,
      source_filename = EXCLUDED.source_filename,
      updated_at = now()
    RETURNING id, title, subtitle, genre, player_count, duration_minutes, difficulty,
              tags, author, cover, description, status, content, i18n, source_filename,
              published, updated_at`,
    [
      script.id,
      script.title,
      script.subtitle,
      script.genre,
      script.players,
      Number.parseInt(String(script.duration || "").match(/\d+/)?.[0] || "0", 10) || null,
      script.difficulty,
      script.tags || [],
      script.author,
      script.cover,
      script.description,
      script.status,
      JSON.stringify(script.content || {}),
      JSON.stringify(script.i18n || {}),
      filename
    ]
  );
  await pool.query(
    `INSERT INTO content_imports (filename, script_id, status, payload)
     VALUES ($1, $2, 'success', $3::jsonb)`,
    [filename, script.id, JSON.stringify(script)]
  );
  return rowToScript(result.rows[0]);
}

export async function databaseHealth() {
  if (!pool) return { enabled: false };
  const result = await pool.query("SELECT count(*)::int AS script_count FROM scripts WHERE published = TRUE");
  return { enabled: true, scriptCount: result.rows[0].script_count };
}

function progressPayload(row) {
  return {
    played: Number(row?.played || 0),
    solved: Number(row?.solved || 0),
    clues: Number(row?.clues || 0),
    questions: Number(row?.questions || 0)
  };
}

export async function getDatabaseLeaderboard(limit = 20, viewerExternalKey = "") {
  if (!pool) return null;
  await waitForDatabaseShape();
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const viewer = String(viewerExternalKey || "").trim();
  const result = await pool.query(
    `SELECT row_number() OVER (ORDER BY progress.solved DESC, progress.played DESC, progress.updated_at ASC) AS rank,
            progress.user_id, users.external_key, users.display_name,
            progress.played, progress.solved, progress.clues, progress.questions
       FROM player_progress progress
       JOIN app_users users ON users.id = progress.user_id
      WHERE progress.played > 0
      ORDER BY progress.solved DESC, progress.played DESC, progress.updated_at ASC
      LIMIT $1`,
    [safeLimit]
  );
  return {
    leaderboard: result.rows.map((row) => ({
      rank: Number(row.rank),
      displayName: row.display_name || "Night Watcher",
      played: Number(row.played || 0),
      solved: Number(row.solved || 0),
      clues: Number(row.clues || 0),
      questions: Number(row.questions || 0),
      isSelf: Boolean(viewer && row.external_key === viewer)
    }))
  };
}

export async function recordDatabaseCompletion(profile = {}, payload = {}) {
  if (!pool) return null;
  await waitForDatabaseShape();
  const scriptId = String(payload.scriptId || payload.script_id || "").trim();
  const completionKey = String(payload.completionKey || payload.completion_key || "").trim().slice(0, 200);
  if (!scriptId || !completionKey) throw new RoomError("INVALID_PROGRESS", "A script and completion key are required");
  const solved = payload.solved === true;
  const clues = Math.min(Math.max(Number(payload.clues) || 0, 0), 100);
  const questions = Math.min(Math.max(Number(payload.questions) || 0, 0), 100);
  const roomId = /^[0-9a-f-]{36}$/i.test(String(payload.roomId || "")) ? String(payload.roomId) : null;
  return inTransaction(async (client) => {
    const user = await ensureUser(client, profile);
    const inserted = await client.query(
      `INSERT INTO player_completions (user_id, completion_key, script_id, room_id, solved, clues, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, completion_key) DO NOTHING
       RETURNING user_id`,
      [user.id, completionKey, scriptId, roomId, solved, clues, questions]
    );
    if (inserted.rows[0]) {
      await client.query(
        `INSERT INTO player_progress (user_id, played, solved, clues, questions)
         VALUES ($1, 1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           played = player_progress.played + 1,
           solved = player_progress.solved + EXCLUDED.solved,
           clues = player_progress.clues + EXCLUDED.clues,
           questions = player_progress.questions + EXCLUDED.questions,
           updated_at = now()`,
        [user.id, solved ? 1 : 0, clues, questions]
      );
    }
    const progress = await client.query(
      "SELECT played, solved, clues, questions FROM player_progress WHERE user_id = $1",
      [user.id]
    );
    return { recorded: Boolean(inserted.rows[0]), progress: progressPayload(progress.rows[0]) };
  });
}

class RoomError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export { RoomError };

async function ensureUser(client, profile = {}) {
  const externalKey = String(profile.externalKey || `guest-${crypto.randomUUID()}`).slice(0, 160);
  const displayName = String(profile.displayName || "Night Watcher").slice(0, 80);
  const locale = profile.locale === "zh" ? "zh" : "en";
  const result = await client.query(
    `INSERT INTO app_users (external_key, display_name, locale, country_code, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (external_key) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       locale = EXCLUDED.locale,
       country_code = COALESCE(EXCLUDED.country_code, app_users.country_code),
       avatar_url = COALESCE(EXCLUDED.avatar_url, app_users.avatar_url),
       updated_at = now()
     RETURNING id, external_key, display_name, locale, avatar_url`,
    [externalKey, displayName, locale, profile.countryCode || null, profile.avatarUrl || null]
  );
  return result.rows[0];
}

const roomSelect = `
  SELECT r.id, r.script_id, s.title, s.subtitle, s.cover,
         r.host_user_id, host.external_key AS host_external_key, host.display_name AS host_name, r.status, r.max_players,
         r.created_at, r.started_at, r.ended_at,
         latest_session.id AS session_id, latest_session.phase AS session_phase, latest_session.state AS session_state,
         latest_session.started_at AS session_started_at, latest_session.ended_at AS session_ended_at,
         (SELECT count(*)::int FROM room_members active_rm WHERE active_rm.room_id = r.id AND active_rm.left_at IS NULL AND active_rm.member_role <> 'spectator') AS players,
         COALESCE((SELECT json_agg(json_build_object(
           'userId', member.user_id,
           'displayName', member_user.display_name,
           'role', member.member_role,
           'characterKey', member.character_key,
           'ready', member.ready,
           'externalKey', member_user.external_key,
           'joinedAt', member.joined_at
         ) ORDER BY member.joined_at) FROM room_members member JOIN app_users member_user ON member_user.id = member.user_id WHERE member.room_id = r.id AND member.left_at IS NULL), '[]'::json) AS members
    FROM rooms r
    JOIN scripts s ON s.id = r.script_id
    LEFT JOIN app_users host ON host.id = r.host_user_id
    LEFT JOIN LATERAL (
      SELECT gs.id, gs.phase, gs.state, gs.started_at, gs.ended_at
        FROM game_sessions gs
       WHERE gs.room_id = r.id
       ORDER BY gs.started_at DESC
       LIMIT 1
    ) latest_session ON TRUE`;

function rowToRoom(row, viewerExternalKey = "") {
  return {
    id: row.id,
    scriptId: row.script_id,
    title: row.title,
    subtitle: row.subtitle,
    cover: row.cover,
    hostName: row.host_name || "Night Watcher",
    isHost: Boolean(viewerExternalKey && row.host_external_key === viewerExternalKey),
    status: row.status,
    maxPlayers: row.max_players,
    players: row.players,
    spotsLeft: Math.max(0, row.max_players - row.players),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    startedAt: row.started_at instanceof Date ? row.started_at.toISOString() : row.started_at,
    endedAt: row.ended_at instanceof Date ? row.ended_at.toISOString() : row.ended_at,
    session: row.session_id ? {
      id: row.session_id,
      phase: row.session_phase,
      state: row.session_state || {},
      startedAt: row.session_started_at instanceof Date ? row.session_started_at.toISOString() : row.session_started_at,
      endedAt: row.session_ended_at instanceof Date ? row.session_ended_at.toISOString() : row.session_ended_at
    } : null,
    // Character assignments are private. They are returned only by the
    // authenticated room-session endpoint, never by public room metadata.
    members: (row.members || []).map((member) => {
      const { externalKey, ...safeMember } = member;
      const isSelf = Boolean(viewerExternalKey && externalKey === viewerExternalKey);
      return { ...safeMember, characterKey: isSelf ? (member.characterKey || null) : null, isSelf };
    })
  };
}

async function getRoom(client, roomId, viewerExternalKey = "") {
  const result = await client.query(`${roomSelect} WHERE r.id = $1`, [roomId]);
  if (!result.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
  return rowToRoom(result.rows[0], viewerExternalKey);
}

async function inTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function expireStaleRooms() {
  if (!pool) return;
  await pool.query(
    `UPDATE rooms
        SET status = 'closed', ended_at = COALESCE(ended_at, now())
      WHERE status IN ('waiting', 'live')
        AND created_at < now() - interval '24 hours'`
  );
}

export async function listDatabaseRooms(status = "waiting", viewerExternalKey = "") {
  if (!pool) return null;
  await expireStaleRooms();
  const values = status && ["waiting", "live", "closed"].includes(status) ? [status] : [];
  const result = await pool.query(`${roomSelect}${values.length ? " WHERE r.status = $1" : ""} ORDER BY r.created_at DESC LIMIT 50`, values);
  return result.rows.map((row) => rowToRoom(row, viewerExternalKey));
}

export async function getDatabaseRoom(roomId, profile = {}) {
  if (!pool) return null;
  await expireStaleRooms();
  const client = await pool.connect();
  try {
    const room = await getRoom(client, roomId, String(profile.externalKey || ""));
    return room;
  } finally {
    client.release();
  }
}

export async function getDatabaseRoomByCode(code, profile = {}) {
  if (!pool) return null;
  const normalized = String(code || "").trim().toLowerCase();
  if (!/^[a-f0-9]{8}(?:[a-f0-9-]{0,28})$/.test(normalized)) return null;
  await expireStaleRooms();
  const client = await pool.connect();
  try {
    const result = await client.query(`${roomSelect} WHERE r.id::text LIKE $1 AND r.status IN ('waiting', 'live') ORDER BY r.created_at DESC LIMIT 1`, [`${normalized}%`]);
    return result.rows[0] ? rowToRoom(result.rows[0], String(profile.externalKey || "")) : null;
  } finally {
    client.release();
  }
}

export async function deleteDatabaseUser(profile = {}) {
  if (!pool) return null;
  const externalKey = String(profile.externalKey || "").trim();
  if (!externalKey) return { deleted: false };
  return inTransaction(async (client) => {
    const user = await client.query("SELECT id FROM app_users WHERE external_key = $1 FOR UPDATE", [externalKey]);
    if (!user.rows[0]) return { deleted: false };
    await client.query("UPDATE rooms SET status = 'closed', ended_at = COALESCE(ended_at, now()), host_user_id = NULL WHERE host_user_id = $1 AND status <> 'closed'", [user.rows[0].id]);
    await client.query("DELETE FROM app_users WHERE id = $1", [user.rows[0].id]);
    return { deleted: true };
  });
}

export async function createDatabaseRoom(scriptId, profile = {}, maxPlayers = 6) {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const script = await client.query("SELECT id, player_count FROM scripts WHERE id = $1 AND published = TRUE", [scriptId]);
    if (!script.rows[0]) throw new RoomError("SCRIPT_NOT_FOUND", "Script not found");
    const user = await ensureUser(client, profile);
    const scriptPlayerCount = Number(script.rows[0].player_count) || 6;
    const requestedPlayers = Number(maxPlayers) || scriptPlayerCount;
    const roomMaxPlayers = Math.min(Math.max(requestedPlayers, 2), Math.min(Math.max(scriptPlayerCount, 2), 8));
    const room = await client.query(
      `INSERT INTO rooms (script_id, host_user_id, max_players) VALUES ($1, $2, $3) RETURNING id`,
      [scriptId, user.id, roomMaxPlayers]
    );
    await client.query("INSERT INTO room_members (room_id, user_id, member_role) VALUES ($1, $2, 'host')", [room.rows[0].id, user.id]);
    return getRoom(client, room.rows[0].id, user.external_key);
  });
}

export async function matchDatabaseRoom(scriptId, profile = {}, maxPlayers = 6) {
  if (!pool) return null;
  await waitForDatabaseShape();
  return inTransaction(async (client) => {
    const script = await client.query("SELECT id, player_count FROM scripts WHERE id = $1 AND published = TRUE", [scriptId]);
    if (!script.rows[0]) throw new RoomError("SCRIPT_NOT_FOUND", "Script not found");
    const user = await ensureUser(client, profile);
    const scriptPlayerCount = Number(script.rows[0].player_count) || 6;
    const requestedPlayers = Number(maxPlayers) || scriptPlayerCount;
    const roomMaxPlayers = Math.min(Math.max(requestedPlayers, 2), Math.min(Math.max(scriptPlayerCount, 2), 8));
    const candidates = await client.query(
      `SELECT r.id, r.max_players
         FROM rooms r
        WHERE r.script_id = $1
          AND r.status = 'waiting'
          AND r.created_at > now() - interval '24 hours'
        ORDER BY r.created_at ASC
        FOR UPDATE SKIP LOCKED`,
      [scriptId]
    );
    for (const candidate of candidates.rows) {
      const existing = await client.query(
        `SELECT member_role FROM room_members
          WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
        [candidate.id, user.id]
      );
      if (existing.rows[0]) return { room: await getRoom(client, candidate.id, user.external_key), matched: true, created: false };
      const count = await client.query(
        `SELECT count(*)::int AS players FROM room_members
          WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator'`,
        [candidate.id]
      );
      if (count.rows[0].players >= candidate.max_players) continue;
      await client.query(
        `INSERT INTO room_members (room_id, user_id, member_role, left_at)
         VALUES ($1, $2, 'player', NULL)
         ON CONFLICT (room_id, user_id) DO UPDATE SET member_role = 'player', joined_at = now(), left_at = NULL, ready = FALSE, character_key = NULL`,
        [candidate.id, user.id]
      );
      return { room: await getRoom(client, candidate.id, user.external_key), matched: true, created: false };
    }
    const room = await client.query(
      `INSERT INTO rooms (script_id, host_user_id, max_players) VALUES ($1, $2, $3) RETURNING id`,
      [scriptId, user.id, roomMaxPlayers]
    );
    await client.query("INSERT INTO room_members (room_id, user_id, member_role) VALUES ($1, $2, 'host')", [room.rows[0].id, user.id]);
    return { room: await getRoom(client, room.rows[0].id, user.external_key), matched: false, created: true };
  });
}

export async function joinDatabaseRoom(roomId, profile = {}, memberRole = "player") {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const roomResult = await client.query("SELECT id, status, max_players FROM rooms WHERE id = $1 FOR UPDATE", [roomId]);
    const room = roomResult.rows[0];
    if (!room) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.status === "closed") throw new RoomError("ROOM_CLOSED", "Room is closed");
    if (room.status === "live" && memberRole !== "spectator") throw new RoomError("ROOM_LIVE", "This room has already started");
    const user = await ensureUser(client, profile);
    const existing = await client.query("SELECT member_role FROM room_members WHERE room_id = $1 AND user_id = $2", [roomId, user.id]);
    if (!existing.rows[0] || existing.rows[0].member_role !== "host") {
      const count = await client.query("SELECT count(*)::int AS players FROM room_members WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator'", [roomId]);
      if (memberRole !== "spectator" && count.rows[0].players >= room.max_players) throw new RoomError("ROOM_FULL", "Room is full");
    }
    await client.query(
      `INSERT INTO room_members (room_id, user_id, member_role, left_at)
       VALUES ($1, $2, $3, NULL)
       ON CONFLICT (room_id, user_id) DO UPDATE SET member_role = EXCLUDED.member_role, joined_at = now(), left_at = NULL, ready = FALSE, character_key = NULL`,
      [roomId, user.id, memberRole]
    );
    return getRoom(client, roomId, user.external_key);
  });
}

export async function leaveDatabaseRoom(roomId, profile = {}) {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const user = await ensureUser(client, profile);
    await client.query("UPDATE room_members SET left_at = now() WHERE room_id = $1 AND user_id = $2", [roomId, user.id]);
    return getRoom(client, roomId, user.external_key);
  });
}

export async function startDatabaseRoom(roomId, profile = {}) {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const user = await ensureUser(client, profile);
    const host = await client.query("SELECT host_user_id, script_id, status FROM rooms WHERE id = $1 FOR UPDATE", [roomId]);
    if (!host.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (host.rows[0].host_user_id !== user.id) throw new RoomError("NOT_HOST", "Only the host can start the room");
    if (host.rows[0].status === "closed") throw new RoomError("ROOM_CLOSED", "Room is closed");
    if (host.rows[0].status === "live") return getRoom(client, roomId, user.external_key);
    const roleKeys = roomRolePool(host.rows[0].script_id);
    const members = await client.query(
      `SELECT user_id, character_key, ready FROM room_members WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator' ORDER BY joined_at ASC FOR UPDATE`,
      [roomId]
    );
    if (members.rows.some((member) => member.ready !== true)) throw new RoomError("ROOM_NOT_READY", "All players must be ready before the host starts the room");
    const selectedRoles = new Set();
    for (const member of members.rows) {
      if (member.character_key && roleKeys.includes(member.character_key) && !selectedRoles.has(member.character_key)) selectedRoles.add(member.character_key);
    }
    const availableRoles = roleKeys.filter((roleKey) => !selectedRoles.has(roleKey));
    for (const member of members.rows) {
      const assignedRole = member.character_key && roleKeys.includes(member.character_key)
        ? member.character_key
        : availableRoles.shift() || roleKeys[members.rows.indexOf(member) % roleKeys.length];
      await client.query("UPDATE room_members SET character_key = $2 WHERE room_id = $1 AND user_id = $3", [roomId, assignedRole, member.user_id]);
    }
    await client.query("UPDATE rooms SET status = 'live', started_at = COALESCE(started_at, now()) WHERE id = $1", [roomId]);
    await client.query(
      "INSERT INTO game_sessions (script_id, room_id, mode, locale, phase, state) VALUES ($1, $2, 'room', $3, 'briefing', $4::jsonb)",
      [host.rows[0].script_id, roomId, user.locale, JSON.stringify({ phase: "briefing", discovered: [], questionCount: 0, answers: [], votes: [] })]
    );
    return getRoom(client, roomId, user.external_key);
  });
}

export async function closeDatabaseRoom(roomId, profile = {}) {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const user = await ensureUser(client, profile);
    const room = await client.query("SELECT host_user_id FROM rooms WHERE id = $1 FOR UPDATE", [roomId]);
    if (!room.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.rows[0].host_user_id !== user.id) throw new RoomError("NOT_HOST", "Only the host can close the room");
    await client.query("UPDATE rooms SET status = 'closed', ended_at = COALESCE(ended_at, now()) WHERE id = $1", [roomId]);
    return getRoom(client, roomId, user.external_key);
  });
}

export async function setDatabaseRoomReady(roomId, profile = {}, ready = true) {
  if (!pool) return null;
  await waitForDatabaseShape();
  return inTransaction(async (client) => {
    const { user, role } = await requireRoomMember(client, roomId, profile);
    if (role === "spectator") throw new RoomError("ROLE_FORBIDDEN", "Spectators cannot change the game state");
    const room = await client.query("SELECT status FROM rooms WHERE id = $1", [roomId]);
    if (!room.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.rows[0].status !== "waiting") throw new RoomError("ROOM_LIVE", "This room has already started");
    await client.query("UPDATE room_members SET ready = $3 WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL", [roomId, user.id, Boolean(ready)]);
    return getRoom(client, roomId, user.external_key);
  });
}

export async function setDatabaseRoomRole(roomId, profile = {}, characterKey = "") {
  if (!pool) return null;
  await waitForDatabaseShape();
  return inTransaction(async (client) => {
    const { user, role } = await requireRoomMember(client, roomId, profile);
    if (role === "spectator") throw new RoomError("ROLE_FORBIDDEN", "Spectators cannot choose a character");
    const room = await client.query("SELECT script_id, status FROM rooms WHERE id = $1", [roomId]);
    if (!room.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.rows[0].status !== "waiting") throw new RoomError("ROOM_LIVE", "This room has already started");
    const normalizedKey = String(characterKey || "").trim();
    if (!normalizedKey) {
      await client.query("UPDATE room_members SET character_key = NULL, ready = FALSE WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL", [roomId, user.id]);
      return getRoom(client, roomId, user.external_key);
    }
    if (!roomRolePool(room.rows[0].script_id).includes(normalizedKey)) throw new RoomError("ROLE_NOT_FOUND", "Character is not available for this script");
    const taken = await client.query(
      "SELECT 1 FROM room_members WHERE room_id = $1 AND character_key = $2 AND user_id <> $3 AND left_at IS NULL LIMIT 1",
      [roomId, normalizedKey, user.id]
    );
    if (taken.rows[0]) throw new RoomError("ROLE_TAKEN", "Character is already taken");
    await client.query("UPDATE room_members SET character_key = $2, ready = FALSE WHERE room_id = $1 AND user_id = $3 AND left_at IS NULL", [roomId, normalizedKey, user.id]);
    return getRoom(client, roomId, user.external_key);
  });
}

function roomMessagePayload(row) {
  return {
    id: String(row.id),
    userId: row.user_id || null,
    displayName: row.display_name || "Night Watcher",
    body: row.body,
    createdAt: isoDate(row.created_at)
  };
}

export async function getDatabaseRoomMessages(roomId, profile = {}, since = 0) {
  if (!pool) return null;
  await waitForDatabaseShape();
  const cursor = /^\d+$/.test(String(since || "")) ? String(since) : "0";
  const client = await pool.connect();
  try {
    const { user } = await requireRoomMember(client, roomId, profile);
    const result = await client.query(
      `SELECT message.id, message.user_id, message.body, message.created_at, member_user.display_name
         FROM room_messages message
         JOIN app_users member_user ON member_user.id = message.user_id
        WHERE message.room_id = $1 AND message.id > $2::bigint
          AND NOT EXISTS (SELECT 1 FROM user_blocks block WHERE block.blocker_user_id = $3 AND block.blocked_user_id = message.user_id)
        ORDER BY message.id ASC
        LIMIT 100`,
      [roomId, cursor, user.id]
    );
    const messages = result.rows.map(roomMessagePayload);
    return { messages, nextCursor: messages.at(-1)?.id || cursor };
  } finally {
    client.release();
  }
}

export async function appendDatabaseRoomMessage(roomId, profile = {}, body = "") {
  if (!pool) return null;
  await waitForDatabaseShape();
  const message = String(body || "").trim().slice(0, 500);
  if (!message) throw new RoomError("EMPTY_MESSAGE", "Message cannot be empty");
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    const room = await client.query("SELECT status FROM rooms WHERE id = $1", [roomId]);
    if (!room.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.rows[0].status === "closed") throw new RoomError("ROOM_CLOSED", "Room is closed");
    const result = await client.query(
      `INSERT INTO room_messages (room_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, body, created_at`,
      [roomId, user.id, message]
    );
    return { message: roomMessagePayload({ ...result.rows[0], user_id: user.id, display_name: user.display_name }) };
  });
}

export async function reportDatabaseRoomMessage(roomId, messageId, profile = {}, reason = "other") {
  if (!pool) return null;
  await waitForDatabaseShape();
  const safeReason = String(reason || "other").trim().slice(0, 120) || "other";
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    const message = await client.query("SELECT id FROM room_messages WHERE id = $1 AND room_id = $2", [messageId, roomId]);
    if (!message.rows[0]) throw new RoomError("REPORT_NOT_FOUND", "Message not found");
    const report = await client.query(
      `INSERT INTO room_message_reports (room_id, message_id, reporter_user_id, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (message_id, reporter_user_id) DO NOTHING
       RETURNING id, created_at`,
      [roomId, messageId, user.id, safeReason]
    );
    if (!report.rows[0]) throw new RoomError("REPORT_DUPLICATE", "Message already reported");
    return { reported: true, reportId: String(report.rows[0].id), createdAt: isoDate(report.rows[0].created_at) };
  });
}

export async function blockDatabaseRoomUser(roomId, profile = {}, blockedUserId) {
  if (!pool) return null;
  await waitForDatabaseShape();
  if (!blockedUserId || typeof blockedUserId !== "string") throw new RoomError("INVALID_BLOCK", "A user to block is required");
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    if (user.id === blockedUserId) throw new RoomError("INVALID_BLOCK", "You cannot block yourself");
    const target = await client.query(
      `SELECT user_id FROM room_members WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [roomId, blockedUserId]
    );
    if (!target.rows[0]) throw new RoomError("BLOCK_NOT_FOUND", "User is not in this room");
    await client.query(
      `INSERT INTO user_blocks (blocker_user_id, blocked_user_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING`,
      [user.id, blockedUserId]
    );
    return { blocked: true, userId: blockedUserId };
  });
}

const voiceSignalTypes = new Set(["hello", "offer", "answer", "candidate", "leave"]);

function voiceSignalPayload(row) {
  return {
    id: String(row.id),
    senderUserId: row.sender_user_id,
    type: row.signal_type,
    payload: row.payload || {},
    createdAt: isoDate(row.created_at)
  };
}

export async function getDatabaseRoomVoiceSignals(roomId, profile = {}, since = 0) {
  if (!pool) return null;
  await waitForDatabaseShape();
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    const cursor = Math.max(0, Number(since) || 0);
    const result = await client.query(
      `SELECT id, sender_user_id, signal_type, payload, created_at
         FROM room_voice_signals
        WHERE room_id = $1 AND receiver_user_id = $2 AND id > $3::bigint
        ORDER BY id ASC
        LIMIT 100`,
      [roomId, user.id, cursor]
    );
    return { signals: result.rows.map(voiceSignalPayload), nextCursor: result.rows.at(-1)?.id ? String(result.rows.at(-1).id) : String(cursor) };
  });
}

export async function appendDatabaseRoomVoiceSignal(roomId, profile = {}, receiverUserId, signalType, payload = {}) {
  if (!pool) return null;
  await waitForDatabaseShape();
  if (!voiceSignalTypes.has(signalType)) throw new RoomError("INVALID_VOICE_SIGNAL", "Unsupported voice signal");
  if (!receiverUserId || typeof receiverUserId !== "string") throw new RoomError("INVALID_VOICE_SIGNAL", "A voice signal recipient is required");
  const serialized = JSON.stringify(payload && typeof payload === "object" ? payload : {});
  if (serialized.length > 20000) throw new RoomError("INVALID_VOICE_SIGNAL", "Voice signal is too large");
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    const receiver = await client.query(
      `SELECT user_id FROM room_members WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [roomId, receiverUserId]
    );
    if (!receiver.rows[0] || receiver.rows[0].user_id === user.id) throw new RoomError("INVALID_VOICE_SIGNAL", "Voice signal recipient is not available");
    const result = await client.query(
      `INSERT INTO room_voice_signals (room_id, sender_user_id, receiver_user_id, signal_type, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, sender_user_id, signal_type, payload, created_at`,
      [roomId, user.id, receiverUserId, signalType, serialized]
    );
    return voiceSignalPayload(result.rows[0]);
  });
}

const gamePhases = new Set(["briefing", "evidence", "question", "vote", "result"]);
const gameEventTypes = new Set(["phase_changed", "host_phase_changed", "evidence_found", "question_asked", "vote_cast", "result_shown"]);

function isoDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function sessionPayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    roomId: row.room_id,
    scriptId: row.script_id,
    phase: row.phase,
    state: row.state || {},
    locale: row.locale,
    startedAt: isoDate(row.started_at),
    endedAt: isoDate(row.ended_at)
  };
}

function eventPayload(row) {
  return {
    sequence: row.sequence_no,
    type: row.event_type,
    payload: row.payload || {},
    createdAt: isoDate(row.created_at),
    userId: row.user_id || null
  };
}

async function requireRoomMember(client, roomId, profile = {}) {
  const user = await ensureUser(client, profile);
  const member = await client.query(
    `SELECT member_role, character_key FROM room_members WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
    [roomId, user.id]
  );
  if (!member.rows[0]) throw new RoomError("NOT_MEMBER", "Join the room before playing");
  return { user, role: member.rows[0].member_role, characterKey: member.rows[0].character_key };
}

async function getLatestSession(client, roomId, lock = false) {
  const result = await client.query(
    `SELECT id, room_id, script_id, phase, state, locale, started_at, ended_at
       FROM game_sessions
      WHERE room_id = $1
      ORDER BY started_at DESC
      LIMIT 1${lock ? " FOR UPDATE" : ""}`,
    [roomId]
  );
  if (!result.rows[0]) throw new RoomError("SESSION_NOT_FOUND", "The room has not started a game");
  return result.rows[0];
}

export async function getDatabaseRoomSession(roomId, profile = {}, since = 0) {
  if (!pool) return null;
  await waitForDatabaseShape();
  const client = await pool.connect();
  try {
    const room = await client.query("SELECT status FROM rooms WHERE id = $1", [roomId]);
    if (!room.rows[0]) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    const membership = await requireRoomMember(client, roomId, profile);
    const session = await getLatestSession(client, roomId);
    const events = await client.query(
      `SELECT sequence_no, event_type, payload, created_at, user_id
         FROM game_events
        WHERE session_id = $1 AND sequence_no > $2
        ORDER BY sequence_no ASC
        LIMIT 100`,
      [session.id, Math.max(0, Number(since) || 0)]
    );
    return { session: sessionPayload(session), player: { userId: membership.user.id, characterKey: membership.characterKey || "player" }, events: events.rows.map(eventPayload), nextSequence: events.rows.at(-1)?.sequence_no || Number(since) || 0 };
  } finally {
    client.release();
  }
}

function reduceGameState(previous, eventType, payload) {
  const next = {
    ...(previous && typeof previous === "object" ? previous : {}),
    discovered: Array.isArray(previous?.discovered) ? [...new Set(previous.discovered)] : [],
    answers: Array.isArray(previous?.answers) ? [...new Set(previous.answers)] : [],
    votes: Array.isArray(previous?.votes) ? [...previous.votes] : [],
    questionCount: Number(previous?.questionCount || 0)
  };
  if ((eventType === "phase_changed" || eventType === "host_phase_changed") && gamePhases.has(payload.phase)) next.phase = payload.phase;
  if (eventType === "evidence_found" && payload.evidenceId) next.discovered = [...new Set([...next.discovered, String(payload.evidenceId)])];
  if (eventType === "question_asked" && payload.answerKey) {
    next.answers = [...new Set([...next.answers, String(payload.answerKey)])];
    next.questionCount += 1;
  }
  if (eventType === "vote_cast" && payload.suspectId) {
    const voterId = payload.userId ? String(payload.userId) : null;
    next.votes = voterId ? next.votes.filter((vote) => vote.userId !== voterId) : next.votes;
    next.votes.push({ suspectId: String(payload.suspectId), userId: voterId });
  }
  if (eventType === "result_shown") next.phase = "result";
  return next;
}

export async function appendDatabaseGameEvent(roomId, profile = {}, eventType, payload = {}) {
  if (!pool) return null;
  await waitForDatabaseShape();
  if (!gameEventTypes.has(eventType)) throw new RoomError("INVALID_EVENT", "Unsupported game event");
  return inTransaction(async (client) => {
    const { user, role } = await requireRoomMember(client, roomId, profile);
    if (role === "spectator") throw new RoomError("ROLE_FORBIDDEN", "Spectators cannot change the game state");
    const session = await getLatestSession(client, roomId, true);
    if (eventType === "host_phase_changed" && role !== "host") throw new RoomError("ROLE_FORBIDDEN", "Only the host can advance the story");
    if (eventType === "vote_cast" && session.phase !== "vote") throw new RoomError("INVALID_EVENT", "Votes are only accepted during the final accusation");
    if (eventType === "result_shown" && role !== "host") throw new RoomError("ROLE_FORBIDDEN", "Only the host can close the case");
    const currentState = session.state || {};
    const eventPayloadWithUser = { ...payload, userId: user.id };
    const nextState = reduceGameState(currentState, eventType, eventPayloadWithUser);
    let phase = (eventType === "phase_changed" || eventType === "host_phase_changed") && gamePhases.has(payload.phase) ? payload.phase : eventType === "result_shown" ? "result" : session.phase;
    if (eventType === "vote_cast") {
      const playerCount = await client.query("SELECT count(*)::int AS players FROM room_members WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator'", [roomId]);
      const voters = new Set(nextState.votes.filter((vote) => vote.userId).map((vote) => vote.userId));
      if (voters.size >= Number(playerCount.rows[0]?.players || 0)) phase = "result";
    }
    const sequence = await client.query("SELECT COALESCE(MAX(sequence_no), 0) + 1 AS next FROM game_events WHERE session_id = $1", [session.id]);
    const sequenceNo = Number(sequence.rows[0].next);
    const event = await client.query(
      `INSERT INTO game_events (session_id, sequence_no, event_type, payload, user_id)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       RETURNING sequence_no, event_type, payload, created_at, user_id`,
      [session.id, sequenceNo, eventType, JSON.stringify(eventPayloadWithUser), user.id]
    );
    const updated = await client.query(
      `UPDATE game_sessions SET phase = $2, state = $3::jsonb, ended_at = CASE WHEN $2 = 'result' THEN COALESCE(ended_at, now()) ELSE ended_at END WHERE id = $1
       RETURNING id, room_id, script_id, phase, state, locale, started_at, ended_at`,
      [session.id, phase, JSON.stringify({ ...nextState, phase })]
    );
    return { session: sessionPayload(updated.rows[0]), event: eventPayload(event.rows[0]) };
  });
}
