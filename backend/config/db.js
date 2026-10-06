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
        name: "Squat",
        description: "Functional bilateral lower extremity strengthening and pelvic stability drill for hips, knees, and glutes.",
        targetBodyPart: "Legs",
        difficulty: "intermediate",
        defaultSets: 3,
        defaultReps: 15,
        defaultDurationSeconds: 480,
        instructions: [
          "Stand tall with your feet shoulder-width apart, toes pointing slightly outward.",
          "Hinge at your hips and bend your knees as if sitting back into an imaginary chair.",
          "Keep your chest upright and ensure your knees track in line with your toes.",
          "Drive through your heels to return to a full standing posture."
        ],
        demonstrationMedia: "/images/exercises/squat.svg",
        safetyInstructions: "Do not let your knees cave inward or extend excessively past your toes.",
        createdBy: therapist._id
      },
      {
        name: "Arm Raise",
        description: "Gentle forward shoulder flexion to restore range of motion, improve circulation, and prevent impingement.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 300,
        instructions: [
          "Stand tall with feet shoulder-width apart and arms relaxed at your sides.",
          "Slowly raise both arms forward and up toward shoulder height.",
          "Hold the elevated position steadily for 2 seconds.",
          "Lower your arms back down with controlled cadence."
        ],
        demonstrationMedia: "/images/exercises/arm-raise.svg",
        safetyInstructions: "Do not arch your lower back or shrug your shoulders during the lift.",
        createdBy: therapist._id
      },
      {
        name: "Seated Knee Extension",
        description: "Open-chain quadriceps strengthening focusing on terminal knee extension and joint stability.",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 360,
        instructions: [
          "Sit upright on a sturdy chair with your back straight and knees bent at 90 degrees.",
          "Slowly extend your affected leg straight out until horizontal with the floor.",
          "Hold for 2 seconds at peak contraction, engaging your quadriceps.",
          "Return to the starting seated position in a smooth, controlled motion."
        ],
        demonstrationMedia: "/images/exercises/seated-knee-extension.svg",
        safetyInstructions: "Stop immediately if you experience sharp knee joint pain or swelling.",
        createdBy: therapist._id
      },
      {
        name: "Wall Push-Ups",
        description: "Closed-kinetic chain exercise for gentle pectoral, anterior deltoid, and scapular stabilizer re-education.",
        targetBodyPart: "Chest",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 12,
        defaultDurationSeconds: 360,
        instructions: [
          "Stand facing a wall approximately arm-length away.",
          "Place your palms flat against the wall at shoulder height and width.",
          "Slowly bend your elbows to bring your chest smoothly toward the wall.",
          "Push firmly through your palms to return to the starting position."
        ],
        demonstrationMedia: "/images/exercises/wall-push-ups.svg",
        safetyInstructions: "Maintain a neutral spine and avoid sagging your hips.",
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
