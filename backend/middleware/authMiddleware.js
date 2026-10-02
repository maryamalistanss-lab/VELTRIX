const jwt = require("jsonwebtoken");

/**
 * Authentication middleware to verify JWT Bearer tokens.
 * Compliant with AUTH-CONTRACT.md Section 6, 11 and API-CONTRACT.md.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing",
      error: "UNAUTHORIZED"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing",
      error: "UNAUTHORIZED"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.sub || decoded.id;
    const role = decoded.role ? decoded.role.toUpperCase() : "";

    req.user = {
      userId,
      id: userId,
      email: decoded.email,
      role
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again",
        error: "UNAUTHORIZED"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid token or credentials.",
      error: "UNAUTHORIZED"
    });
  }
};

module.exports = authMiddleware;
