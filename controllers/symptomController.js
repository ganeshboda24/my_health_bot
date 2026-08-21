const SymptomAssessment = require("../models/SymptomAssessment");
const {
  processSymptomAssessment,
  sanitizeAssessment
} = require("../services/symptomService");

/**
 * POST /api/symptoms/assess
 * Run a symptom assessment for the authenticated user.
 */
async function assess(req, res, next) {
  try {
    const result = await processSymptomAssessment(
      req.body || {},
      req.memberId,
      { SymptomAssessment }
    );

    const payload = {
      success: true,
      data: {
        assessment: sanitizeAssessment(result.assessment),
        triage: result.triage
      }
    };

    return res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/symptoms/my-assessments
 * Return the authenticated user's own assessments (most recent first).
 */
async function getMyAssessments(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const assessments = await SymptomAssessment.find({ memberId: req.memberId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments.map(sanitizeAssessment)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  assess,
  getMyAssessments
};