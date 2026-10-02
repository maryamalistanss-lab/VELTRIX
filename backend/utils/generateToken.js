const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for an authenticated user.
 * Token expires in 24 hours per AUTH-CONTRACT.md.
 *
 * @param {Object} user - User document or user object
 * @returns {string} - Signed JWT
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  const userId = user._id ? user._id.toString() : String(user.id);
  const role = user.role ? String(user.role).toUpperCase() : "";

  const payload = {
    userId,
    sub: userId,
    email: user.email,
    role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h"
  });
};

module.exports = generateToken;
