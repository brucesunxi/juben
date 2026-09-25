import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

function durationMinutes(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000
});

await client.connect();
try {
  const schema = await fs.readFile(path.join(root, "db", "schema.sql"), "utf8");
  await client.query("BEGIN");
  await client.query(schema);

  const scriptsDir = path.join(root, "data", "scripts");
  const files = (await fs.readdir(scriptsDir)).filter((file) => file.endsWith(".json"));
  for (const filename of files) {
    const payload = JSON.parse(await fs.readFile(path.join(scriptsDir, filename), "utf8"));
    await client.query(
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
        updated_at = now()`,
      [
        payload.id || path.basename(filename, ".json"),
        payload.title || payload.name || path.basename(filename, ".json"),
        payload.subtitle || null,
        payload.genre || null,
        Number(payload.players || payload.playerCount || 1),
        durationMinutes(payload.duration),
        payload.difficulty || null,
        Array.isArray(payload.tags) ? payload.tags : [],
        payload.author || null,
        payload.cover || null,
        payload.description || null,
        payload.status || "draft",
        JSON.stringify(payload.content || {}),
        JSON.stringify(payload.i18n || {}),
        filename
      ]
    );
  }

  await client.query("COMMIT");
  const result = await client.query("SELECT count(*)::int AS script_count FROM scripts WHERE published = TRUE");
  console.log(`Neon schema ready; seeded ${result.rows[0].script_count} published scripts.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
