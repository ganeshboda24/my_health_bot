const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

/**
 * POST /api/auth/register
 * Register a new member.
 */
async function register(req, res, next) {
  try {
    const { name, phone, password, preferredLanguage, role } = req.body || {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters."
      });
    }

    if (!phone || typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit Indian mobile number is required."
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters."
      });
    }

    const normalizedPhone = phone.trim();

    // Duplicate account check
    const existing = await Member.findOne({ phone: normalizedPhone }).select("_id");
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this phone number already exists."
      });
    }

    // Only allow MEMBER or HEALTH_WORKER via public registration. ADMIN is reserved.
    let safeRole = "MEMBER";
    if (role === "HEALTH_WORKER") {
      safeRole = "HEALTH_WORKER";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await Member.create({
      name: name.trim(),
      phone: normalizedPhone,
      password: hashedPassword,
      role: safeRole,
      preferredLanguage: req.body?.preferredLanguage === "te" ? "te" : "en"
    });

    const token = jwt.sign(
      { id: member._id.toString(), role: member.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        token,
        member: member.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate a member and return a JWT.
 */
async function login(req, res, next) {
  try {
    const { phone, password } = req.body || {};

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required."
      });
    }

    const member = await Member.findOne({ phone: String(phone).trim() }).select("+password");

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password."
      });
    }

    const passwordMatches = await bcrypt.compare(password, member.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password."
      });
    }

    const token = jwt.sign(
      { id: member._id.toString(), role: member.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // member.toJSON() strips the password (defined in the model)
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        member: member.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Return the currently authenticated member.
 * Requires requireAuth middleware to have set req.member.
 */
async function getMe(req, res, next) {
  try {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        member: req.member.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe
};