const mongoose = require("mongoose");
const User = require("../models/User");
const Exercise = require("../models/Exercise");

let mongod = null;

const seedDefaultExercises = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const exerciseCount = await Exercise.countDocuments();
    if (exerciseCount > 0) return;

    let therapist = await User.findOne({ role: "THERAPIST" });
    if (!therapist) {
      therapist = await User.create({
        name: "Dr. Sarah Johnson",
        email: "therapist.system@veltrix.com",
        password: "SystemPassword123!",
        role: "THERAPIST"
      });
    }

    const defaultExercises = [
      {
        name: "Seated Knee Extension",
        description: "Strengthens the quadriceps for knee stability and range of motion.",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 360,
        instructions: [
          "Sit upright on a chair with your back straight.",
          "Extend the affected leg until straight.",
          "Hold for two seconds before lowering.",
          "Repeat gently and keep movement controlled."
        ],
        demonstrationMedia: "https://example.com/knee-extension.mp4",
        safetyInstructions: "Stop if you feel sharp pain.",
        createdBy: therapist._id
      },
      {
        name: "Arm Raise",
        description: "Improves shoulder motion and range of motion with controlled elevation.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 300,
        instructions: [
          "Stand tall with arms relaxed at your sides.",
          "Raise both arms forward to shoulder height.",
          "Pause briefly at the top of the movement.",
          "Lower the arms slowly and repeat."
        ],
        demonstrationMedia: "https://example.com/arm-raise.mp4",
        safetyInstructions: "Keep your back tall and avoid shrugging the shoulders.",
        createdBy: therapist._id
      },
      {
        name: "Shoulder Stretch",
        description: "Gentle stretch to improve shoulder mobility and reduce stiffness.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 300,
        instructions: [
          "Sit or stand with your shoulders relaxed.",
          "Bring one arm across your chest.",
          "Use your other hand to guide it gently closer.",
          "Hold for 30 seconds before switching sides."
        ],
        demonstrationMedia: "https://example.com/shoulder-stretch.mp4",
        safetyInstructions: "Do not pull into pain or force the range.",
        createdBy: therapist._id
      }
    ];

    await Exercise.insertMany(defaultExercises);
  } catch (error) {
    console.error("Exercise seed routine failed:", error.message);
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log("No MONGODB_URI provided. Initializing local MongoDB instance...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri() + "veltrix";
      process.env.MONGODB_URI = uri;
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultExercises();
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
