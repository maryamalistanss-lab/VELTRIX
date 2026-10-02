const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Subdocument Schema: AssignedExercise
const assignedExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    default: null
  },
  targetSets: {
    type: Number,
    required: true
  },
  targetReps: {
    type: Number,
    default: null
  },
  targetDurationSeconds: {
    type: Number,
    default: null
  },
  frequency: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "completed", "paused", "cancelled"],
    default: "active"
  },
  therapistNotes: {
    type: String,
    trim: true,
    default: null
  }
});

// Subdocument Schema: TherapistNote
const therapistNoteSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  note: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Core Entity Schema: User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ["PATIENT", "THERAPIST"]
    },
    assignedExercises: {
      type: [assignedExerciseSchema],
      default: []
    },
    therapistNotes: {
      type: [therapistNoteSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Case-insensitive unique index on email
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Pre-save hook: Hash password with bcryptjs if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Schema transforms: Never expose password or internal version key in JSON/objects
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Instance method to compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
