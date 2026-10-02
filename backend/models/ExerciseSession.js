const mongoose = require("mongoose");

const sessionResultsSchema = new mongoose.Schema(
  {
    accuracyPercentage: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const exerciseSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    setsCompleted: {
      type: Number,
      required: true
    },
    repsCompleted: {
      type: Number,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: null
    },
    painBefore: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    painAfter: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    perceivedDifficulty: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      required: true
    },
    completionStatus: {
      type: String,
      enum: ["in-progress", "completed", "paused", "abandoned"],
      default: "completed",
      index: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    sessionResults: {
      type: sessionResultsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: "exercise_sessions"
  }
);

// Targeted indexes for patient history and progress queries
exerciseSessionSchema.index({ patientId: 1, completedAt: -1 });
exerciseSessionSchema.index({ exerciseId: 1 });

// Virtual aliases for frontend contract compatibility
exerciseSessionSchema.virtual("difficulty").get(function () {
  return this.perceivedDifficulty;
});
exerciseSessionSchema.virtual("repetitionsCompleted").get(function () {
  return this.repsCompleted;
});
exerciseSessionSchema.virtual("date").get(function () {
  return this.completedAt;
});

exerciseSessionSchema.set("toJSON", { virtuals: true });
exerciseSessionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("ExerciseSession", exerciseSessionSchema);
