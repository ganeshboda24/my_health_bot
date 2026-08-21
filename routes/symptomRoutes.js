const express = require("express");
const router = express.Router();
const {
  assess,
  getMyAssessments
} = require("../controllers/symptomController");
const { requireAuth } = require("../middleware/authMiddleware");

// All symptom routes require authentication
router.use(requireAuth);

router.post("/assess", assess);
router.get("/my-assessments", getMyAssessments);

module.exports = router;