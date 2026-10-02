const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeExerciseDifficulty = (diff) => {
  if (!diff || typeof diff !== "string") return null;
  const lower = diff.trim().toLowerCase();
  if (lower === "beginner" || lower === "easy") return "beginner";
  if (lower === "intermediate" || lower === "medium" || lower === "moderate") return "intermediate";
  if (lower === "advanced" || lower === "hard" || lower === "difficult") return "advanced";
  return lower;
};

const normalizeSessionDifficulty = (diff) => {
  if (!diff || typeof diff !== "string") return null;
  const lower = diff.trim().toLowerCase();
  if (lower === "easy" || lower === "beginner") return "easy";
  if (lower === "moderate" || lower === "medium" || lower === "intermediate") return "moderate";
  if (lower === "hard" || lower === "difficult" || lower === "advanced") return "hard";
  return lower;
};

const validateExerciseInput = (body) => {
  const errors = [];
  const {
    name,
    description,
    targetBodyPart,
    difficulty,
    instructions,
    defaultSets,
    sets,
    defaultReps,
    reps,
    repetitions,
    defaultDurationSeconds,
    duration
  } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Exercise name is required.");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    errors.push("Exercise description is required.");
  }
  if (!targetBodyPart || typeof targetBodyPart !== "string" || !targetBodyPart.trim()) {
    errors.push("Target body part is required.");
  }

  const normalizedDiff = normalizeExerciseDifficulty(difficulty);
  if (!normalizedDiff || !["beginner", "intermediate", "advanced"].includes(normalizedDiff)) {
    errors.push("Difficulty must be one of: beginner, intermediate, advanced.");
  }

  if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
    errors.push("Instructions must be a non-empty array of step-by-step strings.");
  } else if (!instructions.every((step) => typeof step === "string" && step.trim().length > 0)) {
    errors.push("Each instruction step must be a non-empty string.");
  }

  const setsVal = defaultSets !== undefined ? defaultSets : sets;
  if (setsVal !== undefined && setsVal !== null) {
    if (typeof setsVal !== "number" || isNaN(setsVal) || setsVal < 0) {
      errors.push("sets must be a non-negative number.");
    }
  }

  const repsVal = defaultReps !== undefined ? defaultReps : reps !== undefined ? reps : repetitions;
  if (repsVal !== undefined && repsVal !== null) {
    if (typeof repsVal !== "number" || isNaN(repsVal) || repsVal < 0) {
      errors.push("repetitions must be a non-negative number.");
    }
  }

  const durationVal = defaultDurationSeconds !== undefined ? defaultDurationSeconds : duration;
  if (durationVal !== undefined && durationVal !== null) {
    if (typeof durationVal !== "number" || isNaN(durationVal) || durationVal < 0) {
      errors.push("duration must be a non-negative number.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedDifficulty: normalizedDiff
  };
};

const validateSessionInput = (body) => {
  const errors = [];
  const {
    exerciseId,
    setsCompleted,
    repsCompleted,
    repetitionsCompleted,
    durationSeconds,
    painBefore,
    painAfter,
    perceivedDifficulty,
    difficulty,
    notes,
    completionStatus
  } = body;

  if (!exerciseId || !isValidObjectId(exerciseId)) {
    errors.push("A valid exerciseId is required.");
  }

  if (setsCompleted === undefined || typeof setsCompleted !== "number" || isNaN(setsCompleted) || setsCompleted < 0) {
    errors.push("setsCompleted must be a non-negative number.");
  }

  const repsVal = repsCompleted !== undefined ? repsCompleted : repetitionsCompleted;
  if (repsVal !== undefined && repsVal !== null) {
    if (typeof repsVal !== "number" || isNaN(repsVal) || repsVal < 0) {
      errors.push("repetitions completed must be a non-negative number.");
    }
  }

  if (durationSeconds !== undefined && durationSeconds !== null) {
    if (typeof durationSeconds !== "number" || isNaN(durationSeconds) || durationSeconds < 0) {
      errors.push("durationSeconds must be a non-negative number.");
    }
  }

  if (painBefore === undefined || typeof painBefore !== "number" || isNaN(painBefore) || painBefore < 0 || painBefore > 10) {
    errors.push("painBefore is required and must be a number between 0 and 10.");
  }

  if (painAfter === undefined || typeof painAfter !== "number" || isNaN(painAfter) || painAfter < 0 || painAfter > 10) {
    errors.push("painAfter is required and must be a number between 0 and 10.");
  }

  const diffVal = perceivedDifficulty !== undefined ? perceivedDifficulty : difficulty;
  const normalizedDiff = normalizeSessionDifficulty(diffVal);
  if (!normalizedDiff || !["easy", "moderate", "hard"].includes(normalizedDiff)) {
    errors.push("perceivedDifficulty must be one of: easy, moderate, hard.");
  }

  if (notes !== undefined && notes !== null) {
    if (typeof notes !== "string") {
      errors.push("notes must be a string.");
    } else if (notes.length > 1000) {
      errors.push("notes cannot exceed 1000 characters.");
    }
  }

  if (completionStatus !== undefined && completionStatus !== null) {
    const validStatuses = ["in-progress", "completed", "paused", "abandoned"];
    if (typeof completionStatus !== "string" || !validStatuses.includes(completionStatus.toLowerCase())) {
      errors.push("completionStatus must be one of: in-progress, completed, paused, abandoned.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedDifficulty: normalizedDiff
  };
};

module.exports = {
  isValidObjectId,
  normalizeExerciseDifficulty,
  normalizeSessionDifficulty,
  validateExerciseInput,
  validateSessionInput
};
