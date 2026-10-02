const Exercise = require("../models/Exercise");
const { isValidObjectId, validateExerciseInput, normalizeExerciseDifficulty } = require("../utils/validators");

const formatExercise = (ex) => ({
  id: ex._id,
  name: ex.name,
  description: ex.description,
  targetBodyPart: ex.targetBodyPart,
  difficulty: ex.difficulty,
  defaultSets: ex.defaultSets,
  sets: ex.defaultSets,
  defaultReps: ex.defaultReps,
  reps: ex.defaultReps,
  repetitions: ex.defaultReps,
  defaultDurationSeconds: ex.defaultDurationSeconds,
  duration: ex.defaultDurationSeconds,
  instructions: ex.instructions,
  demonstrationMedia: ex.demonstrationMedia,
  demonstration: ex.demonstrationMedia,
  safetyInstructions: ex.safetyInstructions,
  createdBy: ex.createdBy,
  createdAt: ex.createdAt,
  updatedAt: ex.updatedAt
});

// GET /api/exercises - List Exercise Catalog
const getExercises = async (req, res) => {
  try {
    const { targetBodyPart, difficulty } = req.query;
    const filter = {};

    if (targetBodyPart) {
      filter.targetBodyPart = new RegExp(`^${targetBodyPart.trim()}$`, "i");
    }
    if (difficulty) {
      const normalized = normalizeExerciseDifficulty(difficulty);
      filter.difficulty = normalized || difficulty.trim().toLowerCase();
    }

    const exercises = await Exercise.find(filter).sort({ createdAt: -1 });
    const formattedData = exercises.map(formatExercise);

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve exercise catalog.",
      error: "SERVER_ERROR"
    });
  }
};

// GET /api/exercises/:id - Get Exercise Details by ID
const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      data: formatExercise(exercise)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve exercise details.",
      error: "SERVER_ERROR"
    });
  }
};

// POST /api/exercises - Create Exercise Entry (Therapist Only)
const createExercise = async (req, res) => {
  try {
    const validation = validateExerciseInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(" "),
        error: "BAD_REQUEST"
      });
    }

    const {
      name,
      description,
      targetBodyPart,
      defaultSets,
      sets,
      defaultReps,
      reps,
      repetitions,
      defaultDurationSeconds,
      duration,
      instructions,
      demonstrationMedia,
      demonstration,
      safetyInstructions
    } = req.body;

    const existing = await Exercise.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An exercise with this name already exists.",
        error: "BAD_REQUEST"
      });
    }

    const finalSets = defaultSets !== undefined ? defaultSets : sets !== undefined ? sets : null;
    const finalReps = defaultReps !== undefined ? defaultReps : reps !== undefined ? reps : repetitions !== undefined ? repetitions : null;
    const finalDuration = defaultDurationSeconds !== undefined ? defaultDurationSeconds : duration !== undefined ? duration : null;
    const finalDemo = demonstrationMedia !== undefined ? demonstrationMedia : demonstration !== undefined ? demonstration : null;

    const newExercise = await Exercise.create({
      name: name.trim(),
      description: description.trim(),
      targetBodyPart: targetBodyPart.trim(),
      difficulty: validation.normalizedDifficulty,
      defaultSets: finalSets,
      defaultReps: finalReps,
      defaultDurationSeconds: finalDuration,
      instructions,
      demonstrationMedia: finalDemo,
      safetyInstructions: safetyInstructions || null,
      createdBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: formatExercise(newExercise)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An exercise with this name already exists.",
        error: "BAD_REQUEST"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create exercise entry.",
      error: "SERVER_ERROR"
    });
  }
};

// PUT /api/exercises/:id - Update Exercise Entry (Therapist Only)
const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    const validation = validateExerciseInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(" "),
        error: "BAD_REQUEST"
      });
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    const {
      name,
      description,
      targetBodyPart,
      defaultSets,
      sets,
      defaultReps,
      reps,
      repetitions,
      defaultDurationSeconds,
      duration,
      instructions,
      demonstrationMedia,
      demonstration,
      safetyInstructions
    } = req.body;

    // Check name conflict with other exercises
    const existingConflict = await Exercise.findOne({
      _id: { $ne: id },
      name: name.trim()
    });
    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: "An exercise with this name already exists.",
        error: "BAD_REQUEST"
      });
    }

    exercise.name = name.trim();
    exercise.description = description.trim();
    exercise.targetBodyPart = targetBodyPart.trim();
    exercise.difficulty = validation.normalizedDifficulty;

    const finalSets = defaultSets !== undefined ? defaultSets : sets !== undefined ? sets : exercise.defaultSets;
    const finalReps = defaultReps !== undefined ? defaultReps : reps !== undefined ? reps : repetitions !== undefined ? repetitions : exercise.defaultReps;
    const finalDuration = defaultDurationSeconds !== undefined ? defaultDurationSeconds : duration !== undefined ? duration : exercise.defaultDurationSeconds;
    const finalDemo = demonstrationMedia !== undefined ? demonstrationMedia : demonstration !== undefined ? demonstration : exercise.demonstrationMedia;

    exercise.defaultSets = finalSets;
    exercise.defaultReps = finalReps;
    exercise.defaultDurationSeconds = finalDuration;
    exercise.instructions = instructions;
    exercise.demonstrationMedia = finalDemo;
    exercise.safetyInstructions = safetyInstructions !== undefined ? safetyInstructions : exercise.safetyInstructions;

    // Notice: exercise.createdBy is intentionally NEVER modified on update to preserve ownership

    await exercise.save();

    return res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: formatExercise(exercise)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An exercise with this name already exists.",
        error: "BAD_REQUEST"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update exercise.",
      error: "SERVER_ERROR"
    });
  }
};

// DELETE /api/exercises/:id - Delete Exercise Entry (Therapist Only)
const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found.",
        error: "NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exercise deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete exercise.",
      error: "SERVER_ERROR"
    });
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
