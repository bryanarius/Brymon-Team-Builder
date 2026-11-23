const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// feedback-draft.js is a plain browser script; load it like a <script> tag.
const context = vm.createContext({
  document: { addEventListener() {} },
});

vm.runInContext(
  fs.readFileSync(
    path.join(__dirname, "../../public/js/feedback-draft.js"),
    "utf8",
  ),
  context,
);

const { saveFeedbackDraft, takeFeedbackDraft } = vm.runInContext(
  "({ saveFeedbackDraft, takeFeedbackDraft })",
  context,
);

function memoryStorage() {
  const items = new Map();

  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    size: () => items.size,
  };
}

const MINUTE = 60 * 1000;

test("a saved draft is read back once", () => {
  const storage = memoryStorage();

  saveFeedbackDraft(
    {
      summary: "Showdown import failed",
      details: "Couldn't find Foo (Pokémon 1).",
      attachment: "Foo @ Leftovers",
    },
    storage,
    0,
  );

  // Spread copies it out of the sandbox, for deepEqual.
  assert.deepEqual({ ...takeFeedbackDraft(storage, MINUTE) }, {
    summary: "Showdown import failed",
    details: "Couldn't find Foo (Pokémon 1).",
    attachment: "Foo @ Leftovers",
  });

  assert.equal(storage.size(), 0);
  assert.equal(takeFeedbackDraft(storage, MINUTE), null);
});

test("an old draft is thrown away", () => {
  const storage = memoryStorage();

  saveFeedbackDraft({ summary: "Old" }, storage, 0);

  assert.equal(takeFeedbackDraft(storage, 11 * MINUTE), null);
  assert.equal(storage.size(), 0);
});

test("a long paste is cut to what the server accepts", () => {
  const storage = memoryStorage();

  saveFeedbackDraft({ attachment: "x".repeat(12000) }, storage, 0);

  assert.equal(takeFeedbackDraft(storage, 0).attachment.length, 10000);
});

test("broken or blocked storage gives no draft instead of an error", () => {
  const storage = memoryStorage();
  storage.setItem("brymon:feedback-draft", "not json");

  assert.equal(takeFeedbackDraft(storage, 0), null);

  const blocked = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
    removeItem() {},
  };

  assert.equal(saveFeedbackDraft({ summary: "x" }, blocked, 0), false);
  assert.equal(takeFeedbackDraft(blocked, 0), null);
});
