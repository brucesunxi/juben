import pg from "pg";

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
