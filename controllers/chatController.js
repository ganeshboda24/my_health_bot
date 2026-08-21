const ChatSession = require("../models/ChatSession");
const { getGuidance } = require("../services/aiService");

const MAX_MESSAGE_LENGTH = 500;

/**
 * POST /api/chat/message
 * Send a user message and receive a bot guidance reply.
 * Supports English ("en") and Telugu ("te").
 */
async function sendMessage(req, res, next) {
  try {
    const { message, language } = req.body || {};
    const lang = language === "te" ? "te" : "en";

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty."
      });
    }

    const text = message.trim();
    if (text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      });
    }

    // Run the bilingual guidance engine (safe, deterministic, rule-based)
    const guidance = await getGuidance(text, lang);

    const userMessage = {
      role: "user",
      text,
      timestamp: new Date()
    };

    const botMessage = {
      role: "bot",
      text: guidance.recommendation,
      timestamp: new Date()
    };

    // Find or create the user's current session (latest session, or new)
    let session = await ChatSession.findOne({ memberId: req.memberId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!session) {
      session = new ChatSession({
        memberId: req.memberId,
        language: lang,
        messages: []
      });
    }

    session.language = lang;
    session.messages.push(userMessage, botMessage);

    // Guard against unbounded growth (schema allows max 200)
    if (session.messages.length > 200) {
      session.messages = session.messages.slice(-200);
    }

    await session.save();

    return res.status(200).json({
      success: true,
      data: {
        botReply: botMessage.text,
        urgency: guidance.urgency,
        intent: guidance.intent,
        timestamp: botMessage.timestamp,
        sessionId: session._id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/chat/history
 * Return the authenticated user's own chat sessions (most recent first).
 * ?limit=10&sessionId=...
 */
async function getHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const query = { memberId: req.memberId };
    if (req.query.sessionId) {
      query._id = req.query.sessionId;
    }

    const sessions = await ChatSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-__v");

    // Strip nothing sensitive (chat content is user's own)
    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendMessage,
  getHistory
};