const asyncHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Task = require("../models/taskModel");
const { getWorkspaceForMember } = require("../services/workspaceAccessService");
const { normalizeTags } = require("../services/tagService");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const timestamp = (item) =>
  new Date(item.updatedAt || item.createdAt || 0).getTime();

const searchWorkspaceHistory = asyncHandler(async (req, res) => {
  const workspace = await getWorkspaceForMember(
    req.params.id,
    req.user._id
  );
  const query = String(req.query.q || "").trim().slice(0, 200);
  const tags = normalizeTags(req.query.tags || "");
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  const chats = await Chat.find({ workspace: workspace._id })
    .select("_id chatName")
    .lean();
  const chatIds = chats.map((chat) => chat._id);
  const chatNames = new Map(
    chats.map((chat) => [chat._id.toString(), chat.chatName])
  );
  const textRegex = query ? new RegExp(escapeRegex(query), "i") : null;
  const tagRegexes = tags.map(
    (tag) => new RegExp(`#${escapeRegex(tag)}\\b`, "i")
  );

  const messageConditions = [{ chat: { $in: chatIds } }];
  const taskConditions = [{ workspace: workspace._id }];

  if (textRegex) {
    messageConditions.push({ content: textRegex });
    taskConditions.push({
      $or: [{ heading: textRegex }, { description: textRegex }],
    });
  }
  if (tags.length) {
    messageConditions.push({
      $or: [
        { tags: { $all: tags } },
        ...tagRegexes.map((regex) => ({ content: regex })),
      ],
    });
    taskConditions.push({
      $or: [
        { tags: { $all: tags } },
        ...tagRegexes.flatMap((regex) => [
          { heading: regex },
          { description: regex },
        ]),
      ],
    });
  }

  const [messages, tasks, messageCount] = await Promise.all([
    Message.find({ $and: messageConditions })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name email")
      .lean(),
    Task.find({ $and: taskConditions })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("assignee", "name email")
      .lean(),
    Message.countDocuments({ chat: { $in: chatIds } }),
  ]);

  const results = [
    ...messages.map((message) => ({
      type: "message",
      sourceId: message._id.toString(),
      chatId: message.chat.toString(),
      label: chatNames.get(message.chat.toString()) || "Conversation",
      title: `${message.sender?.name || "Member"} in ${
        chatNames.get(message.chat.toString()) || "conversation"
      }`,
      excerpt: message.content,
      tags: message.tags || [],
      createdAt: message.createdAt,
      score: 1,
    })),
    ...tasks.map((task) => ({
      type: "task",
      sourceId: task._id.toString(),
      label: task.heading,
      title: task.heading,
      excerpt: task.description,
      tags: task.tags || [],
      createdAt: task.updatedAt || task.createdAt,
      score: 1,
    })),
  ]
    .sort((a, b) => timestamp(b) - timestamp(a))
    .slice(0, limit);

  res.json({
    strategy: "database",
    messageCount,
    ragThreshold: null,
    results,
  });
});

module.exports = { searchWorkspaceHistory };
