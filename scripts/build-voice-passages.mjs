import fs from "node:fs";
import vm from "node:vm";
import { buildSceneNarration } from "./build-scene-narration.mjs";

// Keep the approved, built-in story text in one place: the same case data
// rendered by the game also forms the allowlist for on-demand narration.
const source = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const start = source.indexOf("const demoCase = {");
const end = source.indexOf("const caseChineseTranslations = {", start);
if (start < 0 || end < 0) throw new Error("Could not find built-in case data");
const { caseLibrary, caseTranslations } = vm.runInNewContext(`${source.slice(start, end)}\n({ caseLibrary, caseTranslations })`, Object.create(null), { timeout: 1000 });
const cases = ["moon-trial", "old-port-letter", "orbit-7", "velvet-room"];
const manifest = {};
const sceneNarration = buildSceneNarration();

function add(entries, key, text, kind = "host", speakerKey = "host") {
  if (typeof text === "string" && text.trim()) entries[`${kind}:${speakerKey}:${key}`] = text.trim();
}

for (const id of cases) {
  manifest[id] = {};
  for (const locale of ["zh", "en"]) {
    const base = caseLibrary[id];
    const override = locale === "en" ? (caseTranslations[id] || {}) : {};
    const story = { ...base, ...override };
    const evidence = override.evidence
      ? override.evidence.map((item) => ({ ...base.evidence.find((baseItem) => baseItem.id === item.id), ...item }))
      : base.evidence;
    const entries = {};
    for (const field of ["intro", "evidenceLead", "evidenceCopy", "questionCopy", "voteLead", "voteCopy", "resultText"]) {
      add(entries, `passage:${field}`, story[field]);
    }
    Object.values(sceneNarration[id]?.[locale] || {}).forEach((scene) => add(entries, scene.sceneKey, scene.text));
    evidence.forEach((item) => add(entries, `passage:evidence:${item.id}`, item.detail));
    story.timeline.forEach(([, text], index) => add(entries, `passage:timeline:${index}`, text));
    story.suspects.forEach((suspect) => {
      add(entries, "passage:line", suspect.line, "role", suspect.id);
      for (const question of ["time", "motive", "key"]) add(entries, `passage:answer:${question}`, suspect.answers?.[question], "role", suspect.id);
    });
    const playerClue = locale === "zh"
      ? "你可以询问所有人，但不要急着相信第一个听起来合理的解释。"
      : "You may question everyone, but do not trust the first explanation that sounds reasonable.";
    const detectiveObjective = locale === "zh"
      ? "厘清自己的行动线，并找出真正的凶手。"
      : "Protect your own timeline and identify the real culprit.";
    const culpritObjective = locale === "zh"
      ? "保护自己的行动路线，不要让证据把你与真相连在一起。"
      : "Protect your route and keep the evidence from linking you to the truth.";
    for (const roleId of ["player", ...story.suspects.map((suspect) => suspect.id)]) {
      const suspect = story.suspects.find((entry) => entry.id === roleId);
      const label = suspect ? `${suspect.name} · ${suspect.role}` : story.player;
      const actorKind = suspect ? "role" : "host";
      const actorKey = suspect?.id || "host";
      const playerCopy = locale === "zh"
        ? `你是 ${label}。今晚的在场者都知道一部分真相，却没有人知道全部。你的目标不是马上找到答案，而是先确认：谁有机会，谁有动机，谁在说一个无法被证据支持的故事。`
        : `You are ${label}. Everyone here knows part of the truth, but no one knows all of it. Do not rush to an answer; first work out who had the chance, who had the motive and whose story the evidence cannot support.`;
      add(entries, `passage:player:${roleId}`, playerCopy, actorKind, actorKey);
      add(entries, `passage:dossier:identity:${roleId}`, suspect?.role || (locale === "zh" ? "调查者" : "Investigator"), actorKind, actorKey);
      add(entries, `passage:dossier:objective:${roleId}`, roleId === story.solution ? culpritObjective : detectiveObjective, actorKind, actorKey);
      add(entries, `passage:dossier:clue:${roleId}`, suspect?.answers?.key || playerClue, actorKind, actorKey);
    }
    manifest[id][locale] = entries;
  }
}

const output = `${JSON.stringify(manifest, null, 2)}\n`;
const target = new URL("../data/voice-passages.json", import.meta.url);
if (process.argv.includes("--check")) {
  if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== output) {
    throw new Error("Voice passage manifest is out of date; run node scripts/build-voice-passages.mjs");
  }
} else {
  fs.writeFileSync(target, output);
}
