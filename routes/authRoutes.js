const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/me", requireAuth, getMe);

module.exports = router;