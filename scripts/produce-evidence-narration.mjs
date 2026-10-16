import fs from "node:fs/promises";
import { buildEvidenceNarration } from "./build-evidence-narration.mjs";

const base = process.env.NARRATION_API_BASE || "https://juben-lyart.vercel.app";
const token = process.env.ADMIN_REVIEW_TOKEN || await new Promise((resolve) => process.stdin.once("data", (data) => resolve(String(data).trim())));
if (!token) throw new Error("An admin credential is required");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(url, options) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${base}${url}`, { ...options, signal: AbortSignal.timeout(60000) });
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await pause(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`Audio request failed: ${response.status} ${url}`);
  }
}
let count = 0;
for (const [id, locales] of Object.entries(buildEvidenceNarration())) {
  for (const [locale, clues] of Object.entries(locales)) {
    let { assets } = await (await request(`/api/scripts/${id}/audio?locale=${locale}`)).json();
    for (const [clueId, clip] of Object.entries(clues)) {
      const file = new URL(`../public/${clip.audioUrl}`, import.meta.url);
      if ((await fs.stat(file).catch(() => null))?.size > 1000) { count++; continue; }
      let asset = assets.find((entry) => entry.sceneKey === clip.sceneKey && entry.text === clip.text && entry.audioUrl);
      if (!asset) {
        await request(`/api/admin/scripts/${id}/audio/generate`, {
          method: "POST", headers: { "content-type": "application/json", "x-admin-token": token },
          body: JSON.stringify({ asset: { locale, kind: "host", speakerKey: "host", sceneKey: clip.sceneKey, text: clip.text, voiceName: locale === "zh" ? "zh-CN-YunjianNeural" : "en-US-GuyNeural", status: "ready" }, displayName: "Clue Narration Producer", locale })
        });
        ({ assets } = await (await request(`/api/scripts/${id}/audio?locale=${locale}`)).json());
        asset = assets.find((entry) => entry.sceneKey === clip.sceneKey && entry.text === clip.text && entry.audioUrl);
        await pause(3500);
      }
      if (!asset) throw new Error(`Missing generated clue: ${id}/${locale}/${clueId}`);
      const response = await request(asset.audioUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!response.headers.get("content-type")?.includes("audio/") || buffer.length < 1000) throw new Error("Invalid audio response");
      await fs.mkdir(new URL("./", file), { recursive: true });
      await fs.writeFile(file, buffer);
      console.log(`${++count} ${id} ${locale} ${clueId}`);
    }
  }
}
console.log(`Bundled ${count} clue recordings.`);
process.exit(0);
