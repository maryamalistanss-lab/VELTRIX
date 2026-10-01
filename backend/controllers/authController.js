const authService = require("../services/authService");

/**
 * Handle user registration (POST /api/auth/register).
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
        error: "BAD_REQUEST"
      });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        error: "BAD_REQUEST"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: "BAD_REQUEST"
      });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: "BAD_REQUEST"
      });
    }

    const normalizedRole = typeof role === "string" ? role.trim().toUpperCase() : null;
    if (!normalizedRole || !["PATIENT", "THERAPIST"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'PATIENT' or 'THERAPIST'",
        error: "BAD_REQUEST"
      });
    }

    const data = await authService.registerUser({
      name,
      email,
      password,
      role: normalizedRole
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data
    });
  } catch (error) {
    if (error.statusCode === 409 || error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "CONFLICT"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred",
      error: "INTERNAL_ERROR"
    });
  }
};

/**
 * Handle user login (POST /api/auth/login).
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim() || !password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: "BAD_REQUEST"
      });
    }

    const data = await authService.loginUser({
      email,
      password
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "UNAUTHORIZED"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred",
      error: "INTERNAL_ERROR"
    });
  }
};

/**
 * Handle current user context retrieval (GET /api/auth/me).
 */
const getMe = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "NOT_FOUND"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred",
      error: "INTERNAL_ERROR"
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
