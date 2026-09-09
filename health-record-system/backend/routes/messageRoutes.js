const express = require("express");
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  getDoctors,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/unread", protect, getUnreadCount);
router.get("/doctors", protect, authorize("patient"), getDoctors);
router.get("/", protect, getMessages);
router.post("/", protect, sendMessage);

module.exports = router;
