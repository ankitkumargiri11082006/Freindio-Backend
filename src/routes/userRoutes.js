const express = require("express");
const multer = require("multer");
const { getContacts, getChatUsers, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/contacts", protect, getContacts);
router.get("/chats", protect, getChatUsers);
router.put("/profile", protect, upload.single("profilePhoto"), updateProfile);

module.exports = router;