import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const start = source.indexOf("async function deleteProfile() {");
const end = source.indexOf("\nfunction ensureRoomLobby()", start);
assert(start >= 0 && end > start, "Profile deletion entrypoint must be present");

function harness(apiFetch, { confirm = true } = {}) {
  const values = new Map([
    ["nocturne-user-key", "existing-guest"],
    ["nocturne-profile-name", "Case tester"],
    ["nocturne-archive", '["moon-trial"]'],
    ["nocturne-locale", "en"],
  ]);
  const toasts = [];
  let deadline;
  let timerCleared = false;
  let modalClosed = false;
  const state = { profileName: "Case tester", archive: ["moon-trial"], favorites: ["moon-trial"], notifications: ["saved"], stats: { played: 1 } };
  const context = vm.createContext({
    window: { confirm: () => confirm },
    apiFetch,
    AbortController,
    setTimeout: (callback, delay) => { assert.equal(delay, 10000); deadline = callback; return 17; },
    clearTimeout: (id) => { assert.equal(id, 17); timerCleared = true; },
    currentUserProfile: () => ({ externalKey: values.get("nocturne-user-key") }),
    localStorage: { removeItem: (key) => values.delete(key) },
    state,
    t: (key) => key,
    showToast: (message) => toasts.push(message),
    readPlayerStats: () => ({ played: 0 }),
    closeProfileModal: () => { modalClosed = true; },
    applyStaticLocale() {},
    renderLibrary() {},
  });
  const remove = vm.runInContext(`${source.slice(start, end)}\ndeleteProfile;`, context);
  return { remove, values, state, toasts, expire: () => deadline(), cleared: () => timerCleared, modalClosed: () => modalClosed };
}

for (const [description, fetch] of [
  ["network failure", async () => { throw new TypeError("Failed to fetch"); }],
  ["server rejection", async () => ({ ok: false, status: 503 })],
]) {
  test(`${description} preserves the identity needed to retry server deletion`, async () => {
    const h = harness(fetch);
    await h.remove();
    assert.equal(h.values.get("nocturne-user-key"), "existing-guest");
    assert.equal(h.values.get("nocturne-archive"), '["moon-trial"]');
    assert.equal(h.state.profileName, "Case tester");
    assert.deepEqual(h.toasts, ["profileDeleteFailed"]);
    assert.equal(h.modalClosed(), false);
    assert.equal(h.cleared(), true);
  });
}

test("no local data is cleared until the server confirms deletion", async () => {
  let resolveRequest;
  const h = harness((path, options) => {
    assert.equal(path, "/api/profile");
    assert.equal(options.method, "DELETE");
    assert.equal(JSON.parse(options.body).user.externalKey, "existing-guest");
    return new Promise((resolve) => { resolveRequest = resolve; });
  });
  const pending = h.remove();
  assert.equal(h.values.get("nocturne-user-key"), "existing-guest");
  assert.deepEqual(h.toasts, []);
  resolveRequest({ ok: true });
  await pending;
  assert.equal(h.values.has("nocturne-user-key"), false);
  assert.equal(h.values.has("nocturne-archive"), false);
  assert.equal(h.values.get("nocturne-locale"), "en");
  assert.equal(h.state.profileName, "");
  assert.equal(h.state.stats.played, 0);
  assert.equal(h.modalClosed(), true);
  assert.deepEqual(h.toasts, ["profileDeleted"]);
  assert.equal(h.cleared(), true);
});

test("a stalled request is aborted without losing the guest identity", async () => {
  const h = harness((path, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }));
  const pending = h.remove();
  h.expire();
  await pending;
  assert.equal(h.values.get("nocturne-user-key"), "existing-guest");
  assert.deepEqual(h.toasts, ["profileDeleteFailed"]);
  assert.equal(h.cleared(), true);
});

test("canceling the deletion confirmation sends no request", async () => {
  const h = harness(() => { assert.fail("Canceled deletion must not reach the server"); }, { confirm: false });
  await h.remove();
  assert.equal(h.values.get("nocturne-user-key"), "existing-guest");
  assert.deepEqual(h.toasts, []);
});
