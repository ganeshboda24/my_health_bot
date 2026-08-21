/**
 * Symptom Service
 *
 * Orchestrates the flow:
 *   symptoms -> validation -> triage -> recommendation
 *
 * This is NOT a medical diagnosis service.
 */

const { evaluateTriage, buildRecommendation, TRIAGE_LEVELS } = require("./triageService");

const VALID_TRIAGE_LEVELS = [
  TRIAGE_LEVELS.LOW,
  TRIAGE_LEVELS.MEDIUM,
  TRIAGE_LEVELS.HIGH,
  TRIAGE_LEVELS.EMERGENCY
];

/**
 * Validate the incoming symptom payload.
 * @param {{ symptoms?: string[], symptomText?: string, language?: string }} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSymptomInput(body) {
  const errors = [];
  const bodyObj = body || {};
  const symptoms = Array.isArray(bodyObj.symptoms) ? bodyObj.symptoms : [];
  const symptomText = typeof bodyObj.symptomText === "string" ? bodyObj.symptomText.trim() : "";
  const language = bodyObj.language || "en";

  if (symptoms.length === 0 && !symptomText) {
    errors.push("Please provide at least one symptom or a description of how you feel.");
  }

  if (symptoms.length > 20) {
    errors.push("Too many symptoms provided (max 20).");
  }

  for (const symptom of symptoms) {
    if (typeof symptom !== "string" || symptom.trim().length === 0) {
      errors.push("Each symptom must be a non-empty string.");
      break;
    }
    if (symptom.length > 200) {
      errors.push("Each symptom cannot exceed 200 characters.");
      break;
    }
  }

  if (symptomText.length > 2000) {
    errors.push("Symptom text cannot exceed 2000 characters.");
  }

  if (language !== "en" && language !== "te") {
    errors.push("Language must be either 'en' or 'te'.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Process a symptom assessment.
 * @param {Object} payload
 * @param {string} memberId
 * @param {Object} models - { SymptomAssessment }
 * @returns {Promise<{ assessment: Object, triage: Object }>}
 */
async function processSymptomAssessment(payload, memberId, models) {
  const { SymptomAssessment } = models;

  const validation = validateSymptomInput(payload);
  if (!validation.valid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    throw error;
  }

  const symptoms = Array.isArray(payload.symptoms)
    ? payload.symptoms.map((s) => s.trim()).filter(Boolean)
    : [];

  const symptomText = typeof payload.symptomText === "string" ? payload.symptomText.trim() : "";
  const language = payload.language === "te" ? "te" : "en";

  const triage = evaluateTriage(symptoms, symptomText);
  const recommendation = buildRecommendation(triage.level, language);

  const assessment = new SymptomAssessment({
    memberId,
    symptoms,
    symptomText: symptomText || undefined,
    triageLevel: triage.level,
    recommendation,
    language
  });

  await assessment.save();

  return {
    assessment,
    triage: {
      level: triage.level,
      reason: triage.reason,
      recommendation
    }
  };
}

/**
 * Sanitize an assessment object for safe serialization.
 * @param {Object} assessment - Mongoose document
 */
function sanitizeAssessment(assessment) {
  return {
    id: assessment._id.toString(),
    symptoms: assessment.symptoms,
    symptomText: assessment.symptomText || "",
    triageLevel: assessment.triageLevel,
    recommendation: assessment.recommendation,
    language: assessment.language,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt
  };
}

module.exports = {
  validateSymptomInput,
  processSymptomAssessment,
  sanitizeAssessment,
  VALID_TRIAGE_LEVELS
};