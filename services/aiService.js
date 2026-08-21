/**
 * Arogya Innovators - Bilingual (English + Telugu) Health Guidance Engine
 *
 * This is a deterministic, rule-based health guidance engine. It is NOT a
 * doctor and it does NOT make medical diagnoses. It:
 *   - detects intents (greeting, symptom, emergency, thanks, help)
 *   - detects urgent/emergency keywords and escalates immediately
 *   - replies in simple, rural-friendly language (English or Telugu)
 *   - never gives dangerous treatment instructions
 *   - always directs users toward proper medical care when needed
 */

/* ---------------------------------------------------------------------------
 * EMERGENCY KEYWORDS - immediate escalation to professional care
 * ------------------------------------------------------------------------- */
const EMERGENCY_PATTERNS = [
  // English
  /\b(can'?t\s+breathe|can\s+not\s+breathe|difficulty\s+breathe|shortness\s+of\s+breathe)\b/i,
  /\b(chest\s+pain|heart\s+attack|unconscious|fainted|passed\s+out)\b/i,
  /\b(severe\s+bleeding|bleeding\s+heavily|lots?\s+of\s+blood|heavy\s+blood)\b/i,
  /\b(suicide|kill\s+myself|end\s+my\s+life|want\s+to\s+die)\b/i,
  /\b(paraly|stroke|slurred\s+speech|face\s+drooping)\b/i,
  /\b(poison|snake\s+bite|dog\s+bite|major\s+burn)\b/i,
  /\b(convulsions|seizure|not\s+breathing)\b/i,
  /\b(accident|severe\s+injury|serious\s+injury|head\s+injury)\b/i,

  // Telugu
  /(ఊపిరి|ఊపిరాడటం|తీసుకోలేకపోతున్న)/,
  /(గుండెపోటు|గుండె\s+నొప్పి)/,
  /(స్పృహ\s+కోల్పోయ|తెలివి\s+తప్పిన|స్పృహ\s+లేకుండా)/,
  /(నోట\s+నుంచి\s+రక్తం|అతిగా\s+రక్తం)/,
  /(విషం|పాము\s+కాటు|కుక్క\s+కాటు)/,
  /(అపస్మారక|మూప్ఛ|కంపించు)/,
  /(తీవ్రమైన\s+గాయం|ప్రమాదం)/
];

/* ---------------------------------------------------------------------------
 * URGENT (HIGH-RISK) KEYWORDS - * ------------------------------------------------------------------------- */
const URGENT_PATTERNS = [
  /\b(high\s+fever|very\s+high\s+fever|fever\s+above)\b/i,
  /\b(severe\s+stomach|extreme\s+vomiting|vomit\s+blood|blood\s+in\s+stool)\b/i,
  /\b(diarrhoea\s+with\s+blood|cholera|jeundice)\b/i,
  /\b(dehydration|very\s+weak|can'?t\s+drink|can'?t\s+eat)\b/i,
  /\b(labour\s+pain|contractions)\b/i,
  /\b(sugar\s+very\s+high|blood\s+sugar\s+critical)\b/i,
  /\b(bp\s+very\s+high|blood\s+pressure\s+very)\b/i,
  /\b(can'?t\s+see|vision\s+loss|blind)\b/i,
  /\b(high-risk|vulnerable|very\s+old|newborn|infant)\b/i
];

/* ---------------------------------------------------------------------------
 * COMMON SYMPTOM RULES
 * ------------------------------------------------------------------------- */
const SYMPTOM_RULES = [
  {
    keywords: ["headache", "తలనొప్పి", "తల నొప్పి"],
    advice: {
      en: "Mild headaches are common. Drink water, rest in a quiet place, and do not skip meals. If the headache is very severe, comes suddenly, or comes with fever or vision problems, please see a healthcare worker.",
      te: "మిమ్మలు తలనొప్పి సాధారణమే. నీరు తాగండి, నిశబ్దమైన చోట విశ్రాంతి తీసుకోండి, భోజనం దాటవేటం వద్దు. తలనొప్పి చాలా తీవ్రంగా లేదా జ్వరంతో ఉంటే, ఆరోగ్య సిబ్బందిని సంప్రదించండి."
    }
  },
  {
    keywords: ["cough", "cold", "sore throat", "runny nose", "జలుపుస"],
    advice: {
      en: "A cough or cold usually improves on its own in a few days. Drink warm fluids, rest, and avoid cold drinks. If you cannot breathe easily, have a high fever, or symptoms last more than a week, please see a doctor.",
      te: "జలపుసు మరియు దగ్గు కొన్ని రోజుల్లో తగ్గిపోతాయి. వెచ్చని నీళులు తాగండి, పూర్తి నిద్ర తీసుకోండి. శ్వాసలో ఇబ్బంది, ఎక్కువ జ్వరం లేదా వారం కంటే ఎక్కువ ఉంటే డాక్టర్ చూసినట్టు చూసుకోండి."
    }
  },
  {
    keywords: ["stomach", "abdominal", "vomit", "diarrhea", "విరేచనం", "కడుపునొప్పి", "కడుపు నొప్పి"],
    advice: {
      en: "For stomach pain or loose motion, prepare homemade ORS (1 litre clean water + 6 teaspoons sugar + half teaspoon salt) and sip slowly. Eat light food and avoid oily food. If you see blood, severe pain, or the problem lasts more than two days, please see a doctor.",
      te: "కడుపునొప్పి లేదా విరేచనాలకి ఇంటి వద్ద ORS తయారు చేయండి (1 లీటరు శుభ్రమైన నీరు + 6 టీస్పూన్ చక్కెర + అర టీస్పూన్ ఉప్పు). రెండురోజులకు మించి ఉంటే, రం появля లేదా నొప్పి ఎక్కువగా ఉంటే డాక్టర్ చూడండి."
    }
  },
  {
    keywords: ["pressure", "bp", "blood pressure", "రక్తపోటు"],
    advice: {
      en: "If you have high blood pressure, take your tablets regularly and use less salt in food. Do not stop your medicines suddenly. If your BP stays very high (around 180/120), please see a health worker quickly.",
      te: "మీరు అధిక రకపొటని ఉంటే, మందులను క్రమబద్ధంగా తీసుకోండి, ఉప్పు ఎంతో తెలీకండి. BP చాలా ఎక్కవ (180/120) ఉంటే ఎక్కువగా ఉంటే తీవ్రమైన పరిస్థితి."
    }
  },
  {
    keywords: ["sugar", "diabetes", "మధుమేహం"],
    advice: {
      en: "If you have sugar or diabetes, take your tablets on time, drink enough water and do not miss meals. If sugar goes very high or you feel confused, extremely weak or dizzy, please see a doctor soon.",
      te: "మధుమేహం లేదా చకర ఉంటే, మందులను సమయానికి తీసుకోండి. చకర చాలా ఎక్కువ అయితే లేదా తలనివెక్కదొడ్డెల మైశ్యంగా ఉంటే తొందరగా డాక్టర్ చూడండి."
    }
  },
  {
    keywords: ["pregnan", "baby", "గర్భం"],
    advice: {
      en: "If you are pregnant and have strong labour pains, bleeding, reduced baby movements, or a very severe headache, please go to a hospital right away.",
      te: "గర్భిణీ అయితే, ప్రసవ నొప్పి లేదా రక్తస్వావం, శిశువు కదలికలు తీసుకునట్లు ఉంటే తీవ్రంగా ఉంటే వెన్టనే ఆసుపత్రికి వెళ్లండి."
    }
  },
  {
    keywords: ["malaria", "dengue", "typhoid", "జ్వరం"],
    advice: {
      en: "Fever can be from many routine illnesses. But if fever lasts more than three days, or comes with chills and severe body pain, please see a health worker for proper testing and medicine.",
      te: "జ్వరం 3 రోజుల కంటే ఎక్కువ ఉంటే లేదా శీతలము మరియు తీవ్రమైన శరిర నొడ్డు లు వస్తే, సరైన పరీక్షకి మరియు మందుకి ఆరోగ్య కారకర్తను సంప్రదించండి."
    }
  }
];

/* ---------------------------------------------------------------------------
 * GREETING RESPONSES
 * ------------------------------------------------------------------------- */
const GREETING_RESPONSES = {
  en: "Namaste! I am Arogya Sahayak, a health guidance helper. I can discuss your symptoms in simple words and suggest safe next steps. Remember - I am not a doctor, and for serious problems you must see a health worker. I also speak Telugu!",
  te: "నమస్తే! నేన్ చోగా సహాయం చెప్పే సహాయం నిప్పుతానని నుండి... నేను డాక్టర్ ఇప్పటి నిస్..."
};

/* ---------------------------------------------------------------------------
 * LANGUAGE DETECTION
 * ------------------------------------------------------------------------- */
function detectLanguage(text) {
  if (!text) return "en";
  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  return teluguCount > 0 ? "te" : "en";
}

/* ---------------------------------------------------------------------------
 * INTENT DETECTION
 * ------------------------------------------------------------------------- */
function detectIntent(text) {
  if (EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))) {
    return "EMERGENCY";
  }

  if (URGENT_PATTERNS.some((pattern) => pattern.test(text))) {
    return "URGENT";
  }

  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  const greetingMatch = /\b(namaste|hi+|hello|hey|good\s?(morning|afternoon|evening)|ఏలా ఉన్నారు|నమస్తే)\b/i;
  if (greetingMatch.test(lower) && wordCount <= 5) {
    return "GREETING";
  }

  const thanksMatch = /\b(thanks|thank you|ధన్యవాదాలు)\b/i;
  if (thanksMatch.test(lower) && wordCount <= 5) {
    return "THANKS";
  }

  const helpMatch = /\b(help|sahayam|సహాయం)\b/i;
  if (helpMatch.test(lower) && wordCount <= 5) {
    return "HELP";
  }

  const hasSymptomKeyword = SYMPTOM_RULES.some((rule) =>
    rule.keywords.some((keyword) => keyword && lower.includes(keyword.toLowerCase()))
  );

  const injuryOrPainPattern =
    /\b(pain|fever|cough|cold|injury|wound|burn|weak|dizzy|خبر|hurt|trouble)\b/i;

  if (hasSymptomKeyword || injuryOrPainPattern.test(lower)) {
    return "SYMPTOM";
  }

  return "FALLBACK";
}

/* ---------------------------------------------------------------------------
 * RESPONSE BUILDER - * ------------------------------------------------------------------------- */
function buildResponse(intent, text, language) {
  const lang = language === "te" ? "te" : "en";
  const lower = text.toLowerCase();

  switch (intent) {
    case "EMERGENCY": {
      if (lang === "te") {
        return {
          language: "te",
          urgency: "EMERGENCY",
          recommendation:
            "ఇది చాలా అత్యవసరం! తక్షణమే వైద్య సహాయం పొందండి. " +
            "108 అత్యవసర సంఖ్యకు కాల్ చేయండి లేదా వెనుటే సమీపఆసు పుర్తరికి వెళ్లండి. " +
            "ఇంటి వ్యక్తులకు చెప్పి మీరు ఒంటరిగా ఉండకండి. ఇది డాక్టర్ సహాయం కావాలి."
        };
      }
      return {
        language: "en",
        urgency: "EMERGENCY",
        recommendation:
          "What you describe needs immediate professional medical attention. " +
          "Call 108 (emergency services in India) or go to the nearest hospital emergency department now. " +
          "Please ask a family member or neighbour to help you reach care quickly. " +
          "Do not delay, and do not rely on this chat for a diagnosis."
      };
    }

    case "URGENT": {
      if (lang === "te") {
        return {
          language: "te",
          urgency: "HIGH",
          recommendation:
            "మీరు చెప్పిన లక్సణాలు వెంటనే చూసుకోవాలి. మీకా 24 గంటల్లో " +
            "సమీప PHC లేదా డాక్టర్ వద్ద చూపించుకోండి. " +
            "ఒకవెళ శ్వాసరిద్ధు, ఎక్కువ రక్తస్తావన, బలహీనతలు - అల్పం; వస్తే 108 కు కాల్ చేయండి."
        };
      }
      return {
        language: "en",
        urgency: "HIGH",
        recommendation:
          "These symptoms should be checked soon. Please visit your nearest " +
          "Primary Health Centre (PHC), medical officer, or hospital within the next day. " +
          "If the situation becomes a clear emergency - severe chest pain, difficulty breathing, " +
          "heavy bleeding, or loss of consciousness - call 108 immediately."
      };
    }

    case "SYMPTOM": {
      const match = SYMPTOM_RULES.find((rule) =>
        rule.keywords.some(
          (keyword) => keyword && lower.includes(keyword.toLowerCase())
        )
      );
      if (match) {
        const advice = match.advice;
        return {
          language: lang,
          urgency: "LOW",
          recommendation: lang === "te" && advice.te ? advice.te : advice.en
        };
      }

      if (lang === "te") {
        return {
          language: "te",
          urgency: "LOW",
          recommendation:
            "మీరు మీ లశనాలను గురించి వివరంగా చెప్పగలరా? ఎప్పటిని ప్రారంభం, " +
            "సడ్డగా రోజులు, ఎంత తీప్తి ఉందో చెప్పండి. నేను డాక్టర్ కాదు - " +
            "అంచి కొనసాగు అయితే లేదా ఇక్కిపోతే డాక్టర్ మెరూ వెళ్లండి."
        };
      }
      return {
        language: "en",
        urgency: "LOW",
        recommendation:
          "Please tell me a little more about your symptoms - when they started, " +
          "how long they have lasted, and how serious they feel. I am not a doctor. " +
          "If symptoms continue or get worse, please see a health worker or doctor."
      };
    }

    case "GREETING": {
      return {
        language: lang,
        urgency: "LOW",
        recommendation: GREETING_RESPONSES[lang]
      };
    }

    case "THANKS": {
      return {
        language: lang,
        urgency: "LOW",
        recommendation:
          lang === "te"
            ? "మీ ధన్యవాదారు! మరే ప్రశ్న ఉంటోటే అడగండి. సతతై డాక్టర్ చదిపొ పెట్టే జాగ్రత్తలు తీసుకోండి."
            : "You are welcome! Feel free to ask me anything else. Please keep following up with doctors or health workers whenever you feel unsure. Take good care of your health!"
      };
    }

    case "HELP": {
      return {
        language: lang,
        urgency: "LOW",
        recommendation:
          lang === "te"
            ? "నేను సహాయం అచే S-ప-న్నాను. మీకు ఏ లక్సణం ఉందో చెప్పండి, ఉదా: 'జ్వరం ఉను' లేదా 'కడుపు నొప్పి'. నేను సూచనలు ఇస్తాను, నేను డాక్టర్ కాదు. ఎక్కువ తీర్ణంగా గా ఉన్నట్లు ఉంటే 108."
            : "I can help you with common symptoms, safe home care suggestions, and when to see a doctor. Just describe how you feel in simple words, like 'I have fever' or 'my stomach hurts'. Remember - I am guidance, not a doctor. For emergencies call 108."
      };
    }

    case "FALLBACK":
    default: {
      return {
        language: lang,
        urgency: "LOW",
        recommendation:
          lang === "te"
            ? "నేను మీకు అంతగా అర్థం కావడందికి క్షమించండి. మీ లక్సానాలను సడలమైన మాటలలో చెప్పండి, ఉదాః 'నాకు పావరజ్వరం' లేదా 'కప్పుపు నొప్పి'. ఎక్కవ ఊపిర్తి, రక్తమూ, తీవ్ర నొపి ఉంటే - 108."
            : "I am sorry, I could not completely understand that. Please describe your symptoms in simple words, like 'I have a fever', 'stomach pain', or 'I feel weak'. If it is a genuine emergency - breathing problem, severe bleeding or severe pain - call 108 or go to a hospital right away."
      };
    }
  }
}

/**
 * Main entry point.
 * @param {string} text - user message
 * @param {string} language - "en" or "te"
 * @returns {{ language: string, urgency: string, recommendation: string, intent: string }}
 */
async function getGuidance(text, language = "en") {
  const safeText = (text || "").toString().trim().slice(0, 500);
  if (!safeText) {
    return {
      language: "en",
      urgency: "LOW",
      intent: "FALLBACK",
      recommendation:
        "Please type your symptoms or ask a health question so I can help guide you."
    };
  }

  const intent = detectIntent(safeText);
  const response = buildResponse(intent, safeText, language);

  // Keep emergency and urgent triage deterministic; use Groq to make routine guidance more conversational.
  if (process.env.GROQ_API_KEY && intent !== "EMERGENCY" && intent !== "URGENT") {
    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          temperature: 0.2,
          max_tokens: 350,
          messages: [
            {
              role: "system",
              content:
                "You are Arogya Sahayak, a cautious health guidance assistant for rural communities in India. " +
                "Reply in simple English unless the user writes Telugu, then reply in Telugu. " +
                "Never diagnose, prescribe, invent medical facts, or advise stopping medicines. " +
                "Give brief safe next steps and clearly say when to visit a PHC or doctor. " +
                "For emergency symptoms, tell the user to call 108 immediately. " +
                "You are not a doctor. Keep the response under 120 words."
            },
            { role: "user", content: safeText }
          ]
        })
      });

      if (groqResponse.ok) {
        const payload = await groqResponse.json();
        const recommendation = payload.choices?.[0]?.message?.content?.trim();
        if (recommendation) response.recommendation = recommendation;
      }
    } catch (error) {
      console.warn("Groq request failed; using rule-based guidance:", error.message);
    }
  }

  return {
    ...response,
    intent
  };
}

module.exports = {
  getGuidance,
  detectIntent,
  detectLanguage,
  buildResponse,
  EMERGENCY_PATTERNS,
  URGENT_PATTERNS
};