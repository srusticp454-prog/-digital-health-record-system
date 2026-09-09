const Message = require("../models/Message");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

// @desc Get all conversations for the logged-in user
// @route GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { recipient: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond:
              [
                { $eq: ["$sender", req.user._id] },
                "$recipient",
                "$sender",
              ].length === 3
                ? { $cond: [{ $eq: ["$sender", req.user._id] }, "$recipient", "$sender"] }
                : null,
            }
          ,
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "otherUser",
        },
      },
      { $unwind: "$otherUser" },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get messages between the logged-in user and another user
// @route GET /api/messages?userId=xxx
const getMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId query param required" });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    })
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: userId, recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Send a message to another user
// @route POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({ message: "recipientId and content are required" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    const populated = await message.populate("sender", "name role").populate("recipient", "name role");

    if (process.env.SMTP_HOST) {
      const subject = "New message from " + req.user.name;
      const html = `<p>Hi ${recipient.name},</p><p>You have a new message from ${req.user.name}:</p><p>${content}</p>`;
      sendEmail({ to: recipient.email, subject, html }).catch((err) =>
        console.error("Failed to send message email:", err.message)
      );
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get count of unread messages
// @route GET /api/messages/unread
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc List all doctors (for patients to message)
// @route GET /api/messages/doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({ path: "user", select: "name email phone hospital" })
      .populate("specialization");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  getDoctors,
};
