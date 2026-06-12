const asyncHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const { getWorkspaceForMember } = require("../services/workspaceAccessService");

const unavailableResponse = (res) => {
  res.set("Retry-After", "86400");
  return res.status(503).json({
    code: "AI_SERVICE_NOT_DEPLOYED",
    message:
      "AI assistant is temporarily unavailable because the AI service is not deployed.",
  });
};

const workspaceAiUnavailable = asyncHandler(async (req, res) => {
  await getWorkspaceForMember(req.params.workspaceId, req.user._id);
  return unavailableResponse(res);
});

const chatAiUnavailable = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    users: req.user._id,
  }).select("_id");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found or access denied");
  }

  return unavailableResponse(res);
});

module.exports = {
  chatAiUnavailable,
  workspaceAiUnavailable,
};
