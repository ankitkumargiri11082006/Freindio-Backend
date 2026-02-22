const express = require("express");
const { getContacts } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/contacts", protect, getContacts);

module.exports = router;