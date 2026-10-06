const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Register a new user account.
 *
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} - Registered user details without password
 */
const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Detect duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    error.code = "CONFLICT";
    throw error;
  }

  // Create new user (pre-save hook hashes password)
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role
  });

  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
};

/**
 * Authenticate user credentials and return a signed JWT.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - Token and safe user profile
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).populate("assignedExercises.assignedBy", "name email");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const token = generateToken(user);

  let assignedTherapist = null;
  if (user.role === "PATIENT" && user.assignedExercises?.length > 0) {
    const firstAssigned = user.assignedExercises.find((a) => a.assignedBy && (typeof a.assignedBy === 'object' && a.assignedBy.name));
    if (firstAssigned && firstAssigned.assignedBy) {
      assignedTherapist = {
        id: (firstAssigned.assignedBy._id || firstAssigned.assignedBy.id).toString(),
        name: firstAssigned.assignedBy.name,
        email: firstAssigned.assignedBy.email
      };
    }
  }

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      assignedTherapist
    }
  };
};

/**
 * Retrieve the current authenticated user context by ID.
 *
 * @param {string} userId - User document ID
 * @returns {Promise<Object>} - Safe user profile
 */
const getCurrentUser = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const user = await User.findById(userId)
    .select("-password")
    .populate("assignedExercises.assignedBy", "name email");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  let assignedTherapist = null;
  if (user.role === "PATIENT" && user.assignedExercises?.length > 0) {
    const firstAssigned = user.assignedExercises.find((a) => a.assignedBy && (typeof a.assignedBy === 'object' && a.assignedBy.name));
    if (firstAssigned && firstAssigned.assignedBy) {
      assignedTherapist = {
        id: (firstAssigned.assignedBy._id || firstAssigned.assignedBy.id).toString(),
        name: firstAssigned.assignedBy.name,
        email: firstAssigned.assignedBy.email
      };
    }
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    assignedTherapist
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
