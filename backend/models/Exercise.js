const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    targetBodyPart: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true
    },
    defaultSets: {
      type: Number,
      default: null
    },
    defaultReps: {
      type: Number,
      default: null
    },
    defaultDurationSeconds: {
      type: Number,
      default: null
    },
    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one instruction step is required."
      }
    },
    demonstrationMedia: {
      type: String,
      default: null
    },
    safetyInstructions: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Targeted indexes for query performance
exerciseSchema.index({ createdBy: 1 });
exerciseSchema.index({ targetBodyPart: 1, difficulty: 1 });

// Virtual aliases for frontend contract compatibility
exerciseSchema.virtual("sets").get(function () {
  return this.defaultSets;
});
exerciseSchema.virtual("reps").get(function () {
  return this.defaultReps;
});
exerciseSchema.virtual("repetitions").get(function () {
  return this.defaultReps;
});
exerciseSchema.virtual("duration").get(function () {
  return this.defaultDurationSeconds;
});
exerciseSchema.virtual("demonstration").get(function () {
  return this.demonstrationMedia;
});

exerciseSchema.set("toJSON", { virtuals: true });
exerciseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Exercise", exerciseSchema);
