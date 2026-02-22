const express = require("express");
const multer = require("multer");
const {
  getConversation,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:userId", protect, getConversation);
router.post("/:userId", protect, upload.single("image"), sendMessage);

module.exports = router;