const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12; // Industry standard for 2025-2026

/**
 * Hash a password using bcrypt with configured salt rounds.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password.
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate access token for user.
 * Short-lived token (15 minutes) for API access.
 * @param {Object} user - User object with id, email, role
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
      issuer: "proxima-server",
      audience: "proxima-client",
    }
  );
};

/**
 * Generate refresh token for user.
 * Long-lived token (7 days) for obtaining new access tokens.
 * @param {Object} user - User object with id, email, role
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
      issuer: "proxima-server",
      audience: "proxima-client",
    }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token
 * @param {string} secret - Secret key for verification
 * @returns {Object} - Decoded token payload
 * @throws {jwt.JsonWebTokenError} - If token is invalid
 * @throws {jwt.TokenExpiredError} - If token has expired
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret, {
    issuer: "proxima-server",
    audience: "proxima-client",
  });
};

/**
 * Decode token without verification (for debugging/logging).
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
