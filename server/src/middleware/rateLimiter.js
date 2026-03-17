const rateLimit = require("express-rate-limit");

/**
 * Helper to check if running in development mode.
 */
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Rate limiter for authentication endpoints.
 * Prevents brute force attacks on login/register.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 10, // Very lenient in development for testing
  message: {
    error: "Too many authentication attempts, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Rate limiter for token endpoint.
 * Prevents abuse of Livekit token generation.
 */
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 30, // More lenient in development
  message: {
    error: "Too many token requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general API endpoints.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 100, // More lenient in development
  message: {
    error: "Too many requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  tokenLimiter,
  generalLimiter,
};
