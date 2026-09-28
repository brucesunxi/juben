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
  : Promise.resolve();

async function waitForDatabaseShape() {
  await databaseShapeReady;
}

function durationLabel(minutes) {
  return minutes ? `${minutes} min` : null;
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
         (SELECT count(*)::int FROM room_members active_rm WHERE active_rm.room_id = r.id AND active_rm.left_at IS NULL) AS players,
         COALESCE((SELECT json_agg(json_build_object(
           'userId', member.user_id,
           'displayName', member_user.display_name,
           'role', member.member_role,
           'characterKey', member.character_key,
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
    members: (row.members || []).map((member) => ({ ...member, characterKey: null }))
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

export async function listDatabaseRooms(status = "waiting", viewerExternalKey = "") {
  if (!pool) return null;
  const values = status && ["waiting", "live", "closed"].includes(status) ? [status] : [];
  const result = await pool.query(`${roomSelect}${values.length ? " WHERE r.status = $1" : ""} ORDER BY r.created_at DESC LIMIT 50`, values);
  return result.rows.map((row) => rowToRoom(row, viewerExternalKey));
}

export async function getDatabaseRoom(roomId, profile = {}) {
  if (!pool) return null;
  const client = await pool.connect();
  try {
    const room = await getRoom(client, roomId, String(profile.externalKey || ""));
    return room;
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
    const script = await client.query("SELECT id FROM scripts WHERE id = $1 AND published = TRUE", [scriptId]);
    if (!script.rows[0]) throw new RoomError("SCRIPT_NOT_FOUND", "Script not found");
    const user = await ensureUser(client, profile);
    const room = await client.query(
      `INSERT INTO rooms (script_id, host_user_id, max_players) VALUES ($1, $2, $3) RETURNING id`,
      [scriptId, user.id, Math.min(Math.max(Number(maxPlayers) || 6, 2), 6)]
    );
    await client.query("INSERT INTO room_members (room_id, user_id, member_role) VALUES ($1, $2, 'host')", [room.rows[0].id, user.id]);
    return getRoom(client, room.rows[0].id, user.external_key);
  });
}

export async function joinDatabaseRoom(roomId, profile = {}, memberRole = "player") {
  if (!pool) return null;
  return inTransaction(async (client) => {
    const roomResult = await client.query("SELECT id, status, max_players FROM rooms WHERE id = $1 FOR UPDATE", [roomId]);
    const room = roomResult.rows[0];
    if (!room) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    if (room.status === "closed") throw new RoomError("ROOM_CLOSED", "Room is closed");
    const user = await ensureUser(client, profile);
    const existing = await client.query("SELECT member_role FROM room_members WHERE room_id = $1 AND user_id = $2", [roomId, user.id]);
    if (!existing.rows[0] || existing.rows[0].member_role !== "host") {
      const count = await client.query("SELECT count(*)::int AS players FROM room_members WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator'", [roomId]);
      if (memberRole !== "spectator" && count.rows[0].players >= room.max_players) throw new RoomError("ROOM_FULL", "Room is full");
    }
    await client.query(
      `INSERT INTO room_members (room_id, user_id, member_role, left_at)
       VALUES ($1, $2, $3, NULL)
       ON CONFLICT (room_id, user_id) DO UPDATE SET member_role = EXCLUDED.member_role, joined_at = now(), left_at = NULL`,
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
    const rolePools = {
      "moon-trial": ["player", "shen", "gu", "he", "su", "luo"],
      "last-letter": ["player", "ye", "tang", "jiang", "wan", "qiao"],
      "old-port-letter": ["player", "ye", "tang", "jiang", "wan", "qiao"],
      "orbit-7": ["player", "mu", "qiao", "rui", "yan", "lin"],
      "velvet-room": ["player", "yin", "bo", "xue", "qi", "meng"]
    };
    const roleKeys = rolePools[host.rows[0].script_id] || rolePools["moon-trial"];
    const members = await client.query(
      `SELECT user_id FROM room_members WHERE room_id = $1 AND left_at IS NULL AND member_role <> 'spectator' ORDER BY joined_at ASC FOR UPDATE`,
      [roomId]
    );
    for (const [index, member] of members.rows.entries()) {
      await client.query("UPDATE room_members SET character_key = $2 WHERE room_id = $1 AND user_id = $3", [roomId, roleKeys[index] || roleKeys[index % roleKeys.length], member.user_id]);
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

const gamePhases = new Set(["briefing", "evidence", "question", "vote", "result"]);
const gameEventTypes = new Set(["phase_changed", "evidence_found", "question_asked", "vote_cast", "result_shown"]);

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
    return { session: sessionPayload(session), player: { characterKey: membership.characterKey || "player" }, events: events.rows.map(eventPayload), nextSequence: events.rows.at(-1)?.sequence_no || Number(since) || 0 };
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
  if (eventType === "phase_changed" && gamePhases.has(payload.phase)) next.phase = payload.phase;
  if (eventType === "evidence_found" && payload.evidenceId) next.discovered = [...new Set([...next.discovered, String(payload.evidenceId)])];
  if (eventType === "question_asked" && payload.answerKey) {
    next.answers = [...new Set([...next.answers, String(payload.answerKey)])];
    next.questionCount += 1;
  }
  if (eventType === "vote_cast" && payload.suspectId) next.votes = [...next.votes, { suspectId: String(payload.suspectId), userId: payload.userId || null }];
  if (eventType === "result_shown") next.phase = "result";
  return next;
}

export async function appendDatabaseGameEvent(roomId, profile = {}, eventType, payload = {}) {
  if (!pool) return null;
  await waitForDatabaseShape();
  if (!gameEventTypes.has(eventType)) throw new RoomError("INVALID_EVENT", "Unsupported game event");
  return inTransaction(async (client) => {
    const { user } = await requireRoomMember(client, roomId, profile);
    const session = await getLatestSession(client, roomId, true);
    const currentState = session.state || {};
    const nextState = reduceGameState(currentState, eventType, payload);
    const phase = eventType === "phase_changed" && gamePhases.has(payload.phase) ? payload.phase : eventType === "result_shown" ? "result" : session.phase;
    const sequence = await client.query("SELECT COALESCE(MAX(sequence_no), 0) + 1 AS next FROM game_events WHERE session_id = $1", [session.id]);
    const sequenceNo = Number(sequence.rows[0].next);
    const event = await client.query(
      `INSERT INTO game_events (session_id, sequence_no, event_type, payload, user_id)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       RETURNING sequence_no, event_type, payload, created_at, user_id`,
      [session.id, sequenceNo, eventType, JSON.stringify({ ...payload, userId: user.id }), user.id]
    );
    const updated = await client.query(
      `UPDATE game_sessions SET phase = $2, state = $3::jsonb, ended_at = CASE WHEN $2 = 'result' THEN COALESCE(ended_at, now()) ELSE ended_at END WHERE id = $1
       RETURNING id, room_id, script_id, phase, state, locale, started_at, ended_at`,
      [session.id, phase, JSON.stringify({ ...nextState, phase })]
    );
    return { session: sessionPayload(updated.rows[0]), event: eventPayload(event.rows[0]) };
  });
}
