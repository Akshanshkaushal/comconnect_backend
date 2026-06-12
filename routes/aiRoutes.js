const express = require("express");

const {
  chatAiUnavailable,
  workspaceAiUnavailable,
} = require("../controllers/aiControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/workspaces/:workspaceId/ask", workspaceAiUnavailable);
router.post("/workspaces/:workspaceId/task-plan", workspaceAiUnavailable);
router.post("/workspaces/:workspaceId/task-plan/apply", workspaceAiUnavailable);
router.post(
  "/workspaces/:workspaceId/event-coordinator",
  workspaceAiUnavailable
);
router.post("/chats/:chatId/summary", chatAiUnavailable);

module.exports = router;
