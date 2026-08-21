const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify the JWT from the Authorization header and attach the member
 * document (without password) to req.member.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again."
      });
    }

    const member = await Member.findById(decoded.id).select("-password");

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists. Please log in again."
      });
    }

    req.member = member;
    req.memberId = member._id.toString();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again."
    });
  }
}

/**
 * Restrict a route to one or more roles.
 * Use after requireAuth: requireRole("ADMIN") or requireRole("ADMIN", "HEALTH_WORKER")
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!roles.includes(req.member.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource."
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};