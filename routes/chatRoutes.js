const express = require("express");
const router = express.Router();
const { sendMessage, getHistory } = require("../controllers/chatController");
const { requireAuth } = require("../middleware/authMiddleware");

// All chat routes require authentication
router.use(requireAuth);

router.post("/message", sendMessage);
router.get("/history", getHistory);

module.exports = router;