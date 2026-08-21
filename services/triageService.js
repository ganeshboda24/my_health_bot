/**
 * Triage Service
 *
 * Determines a triage level based on the user's symptoms and text.
 * Levels: LOW, MEDIUM, HIGH, EMERGENCY
 *
 * IMPORTANT DISCLAIMER:
 * This is a rule-based screening aid, NOT a medical diagnosis.
 * A doctor or health worker must always make the final decision.
 */

const TRIAGE_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  EMERGENCY: "EMERGENCY"
};

/* Emergency keywords - escalate immediately */
const EMERGENCY_KEYWORDS = [
  "breathe", "breathing", "unconscious", "passed out", "fainted",
  "chest pain", "heart attack", "severe bleeding", "bleeding heavily",
  "lots of blood", "heavy blood", "suicide", "kill myself",
  "stroke", "paraly", "slurred speech", "snake bite", "poison",
  "seizure", "convulsions", "not breathing", "accident",
  "severe injury", "serious injury", "head injury", "major burn",
  "ఊపిరి", "గుండెపోటు", "స్పృహ కోల్పోయ", "పాము కాటు",
  "రక్తం", "విషం", "తీవ్రమైన గాయం", "ప్రమాదం", "అపస్మారక"
];

/* High - needs medical care soon */
const HIGH_KEYWORDS = [
  "high fever", "very high fever", "fever above", "severe stomach",
  "vomit blood", "blood in stool", "cholera", "typhoid", "jaundice",
  "dehydration", "very weak", "labour pain", "contractions",
  "blood sugar critical", "bp very high", "can't see", "vision loss"
];

/* Medium - should see a health worker if persists */
const MEDIUM_KEYWORDS = [
  "fever", "malaria", "dengue", "typhoid", "diarrhea", "diarrhoea",
  "vomiting", "dizziness", "weakness", "chest heaviness", "palpitations",
  "pregnant", "pregnancy", "swelling", "difficulty walking",
  "severe headache", "migraine", "rampant", "fever last 3 days"
];

/**
 * Evaluate severity based on symptom keywords.
 * @param {string[]} symptoms - list of symptom labels
 * @param {string} [symptomText] - optional free text
 * @returns {{ level: string, reason: string }}
 */
function evaluateTriage(symptoms = [], symptomText = "") {
  const combined = [
    ...symptoms.map((s) => String(s || "").toLowerCase()),
    String(symptomText || "").toLowerCase()
  ].join(" ").replace(/\s+/g, " ").trim();

  if (!combined) {
    return {
      level: TRIAGE_LEVELS.MEDIUM,
      reason: "Not enough information to give a safe triage level."
    };
  }

  // 1. Emergency first
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (combined.includes(keyword)) {
      return {
        level: TRIAGE_LEVELS.EMERGENCY,
        reason: `Emergency keyword detected: "${keyword}". This person needs immediate professional medical care.`
      };
    }
  }

  // 2. High
  for (const keyword of HIGH_KEYWORDS) {
    if (combined.includes(keyword)) {
      return {
        level: TRIAGE_LEVELS.HIGH,
        reason: `High-risk keyword detected: "${keyword}". Care should be sought very soon.`
      };
    }
  }

  // 3. Medium
  const mediumMatches = MEDIUM_KEYWORDS.filter((k) => combined.includes(k));
  if (mediumMatches.length > 0) {
    return {
      level: TRIAGE_LEVELS.MEDIUM,
      reason: `Medium-risk symptoms detected (${mediumMatches.join(", ")}). A health worker should evaluate if not improving.`
    };
  }

  // 4. Default LOW for generic, non-urgent symptom descriptions
  return {
    level: TRIAGE_LEVELS.LOW,
    reason: "Symptoms described do not match known emergency/high-risk keywords. Direct someone to self-care and a PHC visit if it persists."
  };
}

/**
 * Build a recommendation message based on triage level.
 * @param {string} level - LOW | MEDIUM | HIGH | EMERGENCY
 * @param {string} language - en | te
 */
function buildRecommendation(level, language = "en") {
  const lang = language === "te" ? "te" : "en";

  if (level === TRIAGE_LEVELS.EMERGENCY) {
    return lang === "te"
      ? "ఇది అత్యవసర పరిస్థితి! వెంటనే 108 కు కాల్ చేయండి లేదా సమీప ఆసుపత్రికి వెళ్లండి. ఒంటరిగా ఉండకండి."
      : "This is an emergency. Call 108 or go to the nearest hospital immediately. Do not wait. Emergency medical care is needed right away.";
  }

  if (level === TRIAGE_LEVELS.HIGH) {
    return lang === "te"
      ? "వీలైనంత త్వరగా వైద్య సహాయం పొందండి - సమీప PHC లేదా డాక్టర్ వద్ద చూపించుకోండి. లశనాలు తీవ్రమైతే 108 కు కాల్ చేయండి."
      : "Please get checked by a health worker or PHC as soon as possible, ideally today. If symptoms become severe, call 108.";
  }

  if (level === TRIAGE_LEVELS.MEDIUM) {
    return lang === "te"
      ? "మీ లKSషనలు కొనసాగితే లేదా తీవ్రం అవతాడన్స డాక్టర్ చూసుకోండి. తగినంత నీరు తగండి, విశ్రాం తీసుకోండి."
      : "Monitor the symptoms. Drink water, rest, and see a health worker if they do not improve within 2 days or worsen.";
  }

  return lang === "te"
    ? "మీ లక్షణాలు తక్కువ ప్రమాదం గా కనిపిస్తున్నాయి. విశ్రాంతి, ఆహారం, నీళ్లు తీసుకోండి. తగ్గకపోతే సమీప PHC చూడండి."
    : "Your reported symptoms seem low-risk based on our screening. Rest, drink water, and eat well. If symptoms persist, please visit your nearest PHC.";
}

module.exports = {
  evaluateTriage,
  buildRecommendation,
  TRIAGE_LEVELS
};