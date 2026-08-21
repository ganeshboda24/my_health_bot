/**
 * Lightweight in-memory rate limiter.
 * Limits each IP to `maxRequests` per `windowMs`.
 * No external dependencies - safe for single-instance deployments.
 */

const rateLimitStore = new Map();

function rateLimit({ windowMs = 60 * 1000, maxRequests = 100, message = "Too many requests. Please try again later." } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();

    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(ip, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}

// Periodically clean up stale entries to prevent memory growth
const CLEANUP_INTERVAL_MS = 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

module.exports = { rateLimit };