const test = require("node:test");
const assert = require("node:assert/strict");

const aiRoutes = require("../routes/aiRoutes");
const chatRoutes = require("../routes/chatRoutes");
const workspaceRoutes = require("../routes/workspaceRoutes");

const methodsFor = (router, path) => {
  const layer = router.stack.find((item) => item.route?.path === path);
  assert.ok(layer, `Expected route ${path} to be registered`);
  return Object.keys(layer.route.methods).sort();
};

test("group management routes support the frontend PATCH contract", () => {
  assert.deepEqual(methodsFor(chatRoutes, "/rename"), ["patch", "put"]);
  assert.deepEqual(methodsFor(chatRoutes, "/groupadd"), ["patch", "put"]);
  assert.deepEqual(methodsFor(chatRoutes, "/groupremove"), ["patch", "put"]);
  assert.deepEqual(methodsFor(chatRoutes, "/groupadmin"), ["patch"]);
});

test("workspace history search route is registered", () => {
  assert.deepEqual(methodsFor(workspaceRoutes, "/:id/search"), ["get"]);
});

test("offline AI routes are registered instead of returning 404", () => {
  assert.deepEqual(
    methodsFor(aiRoutes, "/workspaces/:workspaceId/ask"),
    ["post"]
  );
  assert.deepEqual(
    methodsFor(aiRoutes, "/workspaces/:workspaceId/task-plan"),
    ["post"]
  );
  assert.deepEqual(
    methodsFor(aiRoutes, "/workspaces/:workspaceId/task-plan/apply"),
    ["post"]
  );
  assert.deepEqual(
    methodsFor(aiRoutes, "/workspaces/:workspaceId/event-coordinator"),
    ["post"]
  );
  assert.deepEqual(methodsFor(aiRoutes, "/chats/:chatId/summary"), ["post"]);
});
