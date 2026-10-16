import fs from "node:fs";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export function buildSceneNarration() {
  const source = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
  const start = source.indexOf("const demoCase = {");
  const end = source.indexOf("const caseChineseTranslations = {", start);
  if (start < 0 || end < 0) throw new Error("Built-in case data not found");
  const { caseLibrary, caseTranslations } = vm.runInNewContext(`${source.slice(start, end)}\n({ caseLibrary, caseTranslations })`, Object.create(null), { timeout: 1000 });
  const catalog = {};
  for (const id of ["moon-trial", "old-port-letter", "orbit-7", "velvet-room"]) {
    catalog[id] = {};
    for (const locale of ["zh", "en"]) {
      const story = { ...caseLibrary[id], ...(locale === "en" ? caseTranslations[id] : {}) };
      const cast = story.suspects.map((person) => `${person.name}，${person.role}`).join("；");
      const englishCast = story.suspects.map((person) => `${person.name}, ${person.role}`).join("; ");
      // The timeline contains the solution. It belongs only in the final recap;
      // earlier summaries use public scene context, never unrevealed evidence.
      const summaries = locale === "zh" ? {
        briefing: `欢迎来到《${story.title}》。${story.intro} 先认识今晚的在场者：${cast}。你将在自己的角色立场上展开调查，请留意下方角色档案中的身份、目标和已知线索。所有人的说法都需要证据支持。接下来，先进入搜证，查看至少三条线索，再围绕时间、动机和关键物证展开质询。现在不必急着指认，先把事实与猜测分开。准备好后，点击开始搜证。`,
        evidence: `现在进入《${story.title}》的搜证阶段。${story.evidenceLead} ${story.evidenceCopy} 点击现场的线索卡片，查看物品来源与细节；已发现的线索会留在案件笔记里。重点比较时间记录、物品痕迹与人物行动是否相符。暂时不要把可疑之处当作定论。你可以把重要线索加入推理桌，整理它们之间的联系。至少收集三条线索后，就可以进入质询。`,
        question: `现在进入《${story.title}》的质询阶段。${story.questionCopy} 选择一位在场者，分别了解他的行动时间、可能的动机，以及掌握的关键线索。听取回答时，请与已经发现的证据相互核对。一个人说得肯定，并不代表他说的就是事实；同样，可疑的动机也不能单独证明责任。至少完成三次提问，再进入最终指认。`,
        vote: `现在是《${story.title}》的最终指认。${story.voteLead} ${story.voteCopy} 提交之前，回顾案件笔记与各人的回答，检查你的推断能否同时解释时间、机会和关键痕迹。请根据证据选择最能解释整个事件的人。点击人物卡片中的指认按钮即可提交；真相与完整经过会在结局复盘中揭晓。`,
        result: `《${story.title}》的调查来到尾声。现在一起复盘真相。${story.resultText.replace(/^正确。/, "")} 按时间顺序回顾：${story.timeline.map(([time, detail]) => `${time}，${detail}`).join(" ")} 重新对照你发现的线索，看看哪些说法与事实一致，哪些痕迹曾经误导了你。这一幕讲解到此结束。`
      } : {
        briefing: `Welcome to ${story.title}. ${story.intro} Meet the people involved: ${englishCast}. Investigate from your own character's perspective; your dossier below contains your identity, objective and starting clue. Every account needs evidence. First, inspect at least three clues at the scene. Then question the people involved about their timing, motives and key information. There is no need to accuse anyone yet: separate what you know from what you suspect. When you are ready, start the evidence hunt.`,
        evidence: `We now begin the evidence hunt in ${story.title}. ${story.evidenceLead} ${story.evidenceCopy} Open a clue card to inspect its source and details. Discovered clues remain in your case notes. Compare timestamps, physical traces and people's movements, but do not mistake suspicion for proof. Pin useful clues to your deduction board to explore their connections. Once you have collected at least three clues, you can begin questioning.`,
        question: `We now begin questioning in ${story.title}. ${story.questionCopy} Choose a person and ask about their timing, possible motives and key information. Compare each answer with the evidence you have already collected. Confidence does not make a statement true, and a motive alone does not establish responsibility. Ask at least three questions before moving to the final accusation.`,
        vote: `This is the final accusation in ${story.title}. ${story.voteLead} ${story.voteCopy} Before submitting, review your case notes and the answers you received. Does your explanation account for the timing, the opportunity and the physical evidence? Choose the person whose actions best explain the whole incident. Use the accusation button on their card to submit. The truth and full sequence of events will be revealed in the final recap.`,
        result: `The investigation of ${story.title} has reached its conclusion. Let us reconstruct what happened. ${story.resultText.replace(/^Correct\.\s*/, "")} In chronological order: ${story.timeline.map(([time, detail]) => `${time}. ${detail}`).join(" ")} Compare these events with the clues you found. Which accounts matched the evidence, and which traces led you astray? This concludes our case recap.`
      };
      catalog[id][locale] = Object.fromEntries(Object.entries(summaries).map(([phase, text]) => {
        const hash = createHash("sha256").update(text).digest("hex").slice(0, 12);
        return [phase, { text, sceneKey: `summary:${phase}:${hash}`, audioUrl: `assets/narration/${id}/${locale}-${phase}-${hash}.mp3` }];
      }));
    }
  }
  return catalog;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = buildSceneNarration();
  const target = new URL("../public/scene-narration.js", import.meta.url);
  const output = `// Generated by scripts/build-scene-narration.mjs.\nwindow.NOCTURNE_SCENE_NARRATION = ${JSON.stringify(catalog, null, 2)};\n`;
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== output) throw new Error("Scene narration manifest is out of date");
    for (const locales of Object.values(catalog)) for (const scenes of Object.values(locales)) for (const scene of Object.values(scenes)) {
      const file = new URL(`../public/${scene.audioUrl}`, import.meta.url);
      if (!fs.existsSync(file) || fs.statSync(file).size < 1000) throw new Error(`Missing narration: ${scene.audioUrl}`);
    }
    console.log("40 bilingual scene summaries and their audio files verified.");
  } else {
    fs.writeFileSync(target, output);
  }
}
