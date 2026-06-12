const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  transferGroupAdmin,
  deleteAllChats,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.get('/workspace/:workspaceId/chats',protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup).patch(protect, renameGroup);
router
  .route("/groupremove")
  .put(protect, removeFromGroup)
  .patch(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup).patch(protect, addToGroup);
router.route("/groupadmin").patch(protect, transferGroupAdmin);
router.delete('/deleteAll', deleteAllChats);

module.exports = router;
