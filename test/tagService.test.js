const test = require("node:test");
const assert = require("node:assert/strict");

const { extractTags, normalizeTags } = require("../services/tagService");

test("normalizes comma-separated and array tags", () => {
  assert.deepEqual(normalizeTags(" #Launch, urgent,launch "), [
    "launch",
    "urgent",
  ]);
  assert.deepEqual(normalizeTags(["Venue", "#venue", "Budget"]), [
    "venue",
    "budget",
  ]);
});

test("extracts searchable hashtags from content", () => {
  assert.deepEqual(extractTags("Confirm #Venue and #launch_plan today"), [
    "venue",
    "launch_plan",
  ]);
});
