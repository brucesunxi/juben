import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
function entrypoint(startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);
  assert(start >= 0 && end > start, `Missing entrypoint: ${startText}`);
  return source.slice(start, end);
}

function harness({ roomId = null, spectator = false } = {}) {
  const saved = [];
  const uploads = [];
  const events = [];
  const toasts = [];
  const context = vm.createContext({
    state: { stats: { played: 0, solved: 0, clues: 0, questions: 0, completed: [] } },
    gameState: { votedSuspect: null, spectator, roomId, discovered: new Set(["rain", "access", "photo"]), questionCount: 3 },
    activeCase: { id: "moon-trial", solution: "he" },
    savePlayerStats: () => saved.push(JSON.parse(JSON.stringify(context.state.stats))),
    syncProgressCompletion: (record) => uploads.push(JSON.parse(JSON.stringify(record))),
    emitRoomEvent: (type, payload) => events.push({ type, ...payload }),
    renderVote() {},
    applyStaticLocale() {},
    t: (key) => key,
    showToast: (message) => toasts.push(message),
    document: { querySelector: () => ({ parentElement: { classList: { add() {}, remove() {} } } }) },
    setTimeout: (callback) => callback(),
  });
  context.renderResult = () => context.recordCaseCompletion();
  vm.runInContext([
    entrypoint("function castVote(id) {", "\nfunction renderRoomVoteSummary()"),
    entrypoint("function recordCaseCompletion() {", "\nasync function syncProgressCompletion("),
  ].join("\n"), context);
  return { context, saved, uploads, events, toasts };
}

test("a correct solo accusation persists and uploads a solved case exactly once", () => {
  const h = harness();
  h.context.castVote("he");
  assert.equal(h.context.gameState.votedSuspect, "he");
  assert.equal(h.saved.length, 1);
  assert.deepEqual(h.saved[0], { played: 1, solved: 1, clues: 3, questions: 3, completed: ["moon-trial:solo"] });
  assert.equal(h.uploads.length, 1);
  assert.equal(h.uploads[0].solved, true);
  h.context.castVote("he");
  h.context.recordCaseCompletion();
  assert.equal(h.saved.length, 1);
  assert.equal(h.uploads.length, 1);
});

test("a wrong solo accusation can be retried without recording a failed completion", () => {
  const h = harness();
  h.context.castVote("shen");
  assert.equal(h.context.gameState.votedSuspect, null);
  assert.equal(h.saved.length, 0);
  assert.equal(h.uploads.length, 0);
  assert.deepEqual(h.toasts, ["wrong"]);
  h.context.castVote("he");
  assert.equal(h.saved[0].solved, 1);
  assert.equal(h.uploads[0].solved, true);
});

test("a room vote waits for the shared result before recording completion", () => {
  const h = harness({ roomId: "test-room" });
  h.context.castVote("he");
  assert.equal(h.context.gameState.votedSuspect, "he");
  assert.equal(h.saved.length, 0);
  assert.equal(h.uploads.length, 0);
  assert.deepEqual(h.events, [{ type: "vote_cast", suspectId: "he" }]);
  h.context.recordCaseCompletion();
  assert.equal(h.saved[0].solved, 1);
  assert.equal(h.uploads[0].completionKey, "moon-trial:test-room");
});

test("spectators cannot cast votes or earn completion credit", () => {
  const h = harness({ roomId: "test-room", spectator: true });
  h.context.castVote("he");
  h.context.recordCaseCompletion();
  assert.equal(h.context.gameState.votedSuspect, null);
  assert.equal(h.saved.length, 0);
  assert.equal(h.uploads.length, 0);
  assert.deepEqual(h.events, []);
});
