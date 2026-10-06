require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const ExerciseSession = require("../models/ExerciseSession");

const seedExercises = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for controlled demo seeding...");

    // 1. Target Therapists (Exactly 4)
    const therapistDefs = [
      { name: "Test Therapist", email: "therapist.test@veltrix.com", password: "TestTherapist123", role: "THERAPIST" },
      { name: "Dr. Sarah Johnson", email: "sarah.johnson@veltrix.com", password: "Password123!", role: "THERAPIST" },
      { name: "Dr. Michael Chen", email: "michael.chen@veltrix.com", password: "Password123!", role: "THERAPIST" },
      { name: "Dr. Emily Rodriguez", email: "emily.rodriguez@veltrix.com", password: "Password123!", role: "THERAPIST" }
    ];

    const therapistDocs = [];
    for (const def of therapistDefs) {
      let u = await User.findOne({ email: def.email.toLowerCase() });
      if (!u) {
        u = await User.create(def);
        console.log(`Created therapist: ${u.name}`);
      } else {
        u.name = def.name;
        u.role = def.role;
        await u.save();
        console.log(`Retained therapist: ${u.name}`);
      }
      therapistDocs.push(u);
    }

    // 2. Target Patients (Exactly 4)
    const patientDefs = [
      { name: "Test Patient", email: "patient.test@veltrix.com", password: "TestPatient123", role: "PATIENT" },
      { name: "Patient Alpha", email: "patient.alpha@veltrix.com", password: "Password123!", role: "PATIENT" },
      { name: "Patient Beta", email: "patient.beta@veltrix.com", password: "Password123!", role: "PATIENT" },
      { name: "Patient Gamma", email: "patient.gamma@veltrix.com", password: "Password123!", role: "PATIENT" }
    ];

    const patientDocs = [];
    for (const def of patientDefs) {
      let u = await User.findOne({ email: def.email.toLowerCase() });
      if (!u) {
        u = await User.create(def);
        console.log(`Created patient: ${u.name}`);
      } else {
        u.name = def.name;
        u.role = def.role;
        await u.save();
        console.log(`Retained patient: ${u.name}`);
      }
      patientDocs.push(u);
    }

    // Remove unwanted extra users
    const allowedEmails = [...therapistDefs, ...patientDefs].map((d) => d.email.toLowerCase());
    const deletedUsers = await User.deleteMany({ email: { $nin: allowedEmails } });
    console.log(`Cleaned up ${deletedUsers.deletedCount} unwanted extra user records.`);

    // 3. Target Exercises (Exactly 4)
    const defaultTherapist = therapistDocs[0];
    const exerciseDefs = [
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
        createdBy: defaultTherapist._id
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
        createdBy: defaultTherapist._id
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
        createdBy: defaultTherapist._id
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
        createdBy: defaultTherapist._id
      }
    ];

    const exerciseDocs = [];
    for (const def of exerciseDefs) {
      let ex = await Exercise.findOne({ name: def.name });
      if (!ex && def.name === "Wall Push-Ups") {
        ex = await Exercise.findOne({ name: "Wall Push Up" });
      }
      if (!ex) {
        ex = await Exercise.create(def);
        console.log(`Created exercise: ${ex.name}`);
      } else {
        ex.name = def.name;
        ex.description = def.description;
        ex.targetBodyPart = def.targetBodyPart;
        ex.difficulty = def.difficulty;
        ex.defaultSets = def.defaultSets;
        ex.defaultReps = def.defaultReps;
        ex.defaultDurationSeconds = def.defaultDurationSeconds;
        ex.instructions = def.instructions;
        ex.demonstrationMedia = def.demonstrationMedia;
        ex.safetyInstructions = def.safetyInstructions;
        await ex.save();
        console.log(`Updated exercise: ${ex.name}`);
      }
      exerciseDocs.push(ex);
    }

    // Remove unwanted extra exercises
    const allowedExerciseNames = exerciseDefs.map((e) => e.name);
    const deletedExercises = await Exercise.deleteMany({ name: { $nin: allowedExerciseNames } });
    console.log(`Cleaned up ${deletedExercises.deletedCount} unwanted extra exercise records.`);

    // 4. Update Patients' assigned exercises
    const assignedExerciseList = exerciseDocs.map((ex) => ({
      exerciseId: ex._id,
      assignedBy: defaultTherapist._id,
      targetSets: ex.defaultSets || 3,
      targetReps: ex.defaultReps || 10,
      status: "active"
    }));

    for (const p of patientDocs) {
      p.assignedExercises = assignedExerciseList;
      await p.save();
    }

    // 5. Clean up orphaned ExerciseSessions
    const validPatientIds = patientDocs.map((p) => p._id);
    const validExerciseIds = exerciseDocs.map((e) => e._id);
    const deletedSessions = await ExerciseSession.deleteMany({
      $or: [
        { patientId: { $nin: validPatientIds } },
        { exerciseId: { $nin: validExerciseIds } }
      ]
    });
    console.log(`Cleaned up ${deletedSessions.deletedCount} orphaned session records.`);

    // Final Validation Summary
    const finalTherapists = await User.countDocuments({ role: "THERAPIST" });
    const finalPatients = await User.countDocuments({ role: "PATIENT" });
    const finalExercises = await Exercise.countDocuments();
    const finalSessions = await ExerciseSession.countDocuments();

    console.log("\n==========================================");
    console.log("FINAL DEMO DATA VERIFICATION SUMMARY:");
    console.log(`Total Therapists: ${finalTherapists} (Expected: 4)`);
    console.log(`Total Patients:   ${finalPatients} (Expected: 4)`);
    console.log(`Total Exercises:  ${finalExercises} (Expected: 4)`);
    console.log(`Valid Sessions:   ${finalSessions}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedExercises();
