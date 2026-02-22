const Message = require("../models/Message");
const User = require("../models/User");
const { uploadToCloudinary } = require("../config/cloudinary");

const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const userExists = await User.findById(otherUserId).select("_id");
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const text = (req.body.text || "").trim();
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    if (!text && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Message text or image is required" });
    }

    const userExists = await User.findById(otherUserId).select("_id");
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: otherUserId,
      text,
      imageUrl,
    });

    return res.status(201).json({ message });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { getConversation, sendMessage };