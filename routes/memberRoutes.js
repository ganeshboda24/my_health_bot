const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/memberController");
const { requireAuth } = require("../middleware/authMiddleware");

// All member routes require authentication
router.use(requireAuth);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;