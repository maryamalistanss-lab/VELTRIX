require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Exercise = require("../models/Exercise");
const User = require("../models/User");

const seedExercises = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for exercise seeding...");

    // Find a therapist to attribute createdBy
    let therapist = await User.findOne({ role: "THERAPIST" });
    if (!therapist) {
      console.log("No therapist found, creating a system therapist...");
      therapist = await User.create({
        name: "Dr. Sarah Johnson",
        email: "therapist.system@veltrix.com",
        password: "SystemPassword123!",
        role: "THERAPIST"
      });
    }

    const count = await Exercise.countDocuments();
    if (count > 0) {
      console.log(`Exercise collection already contains ${count} exercises.`);
      process.exit(0);
    }

    const defaultExercises = [
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
        demonstrationMedia: "https://assets.veltrix.app/exercises/knee-extension.mp4",
        safetyInstructions: "Stop immediately if you experience sharp knee joint pain or swelling.",
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
        demonstrationMedia: "https://assets.veltrix.app/exercises/arm-raise.mp4",
        safetyInstructions: "Do not arch your lower back or shrug your shoulders during the lift.",
        createdBy: therapist._id
      },
      {
        name: "Shoulder Stretch",
        description: "Posterior capsule horizontal adduction stretch to enhance glenohumeral mobility and relieve stiffness.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 300,
        instructions: [
          "Stand or sit tall with shoulders relaxed.",
          "Gently bring one arm across your upper chest at shoulder level.",
          "Use your opposite hand to gently support your forearm and draw it closer.",
          "Hold the stretch without bouncing for 30 seconds, then alternate sides."
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/shoulder-stretch.mp4",
        safetyInstructions: "Avoid pulling aggressively; keep tension comfortable and pain-free.",
        createdBy: therapist._id
      },
      {
        name: "Wall Push Up",
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
        demonstrationMedia: "https://assets.veltrix.app/exercises/wall-push-up.mp4",
        safetyInstructions: "Maintain a neutral spine and avoid sagging your hips.",
        createdBy: therapist._id
      },
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
        demonstrationMedia: "https://assets.veltrix.app/exercises/squat.mp4",
        safetyInstructions: "Do not let your knees cave inward or extend excessively past your toes.",
        createdBy: therapist._id
      },
      {
        name: "Neck Rotation",
        description: "Gentle active range of motion exercise for cervical rotation mobility and tension relief.",
        targetBodyPart: "Neck",
        difficulty: "beginner",
        defaultSets: 2,
        defaultReps: 10,
        defaultDurationSeconds: 240,
        instructions: [
          "Sit upright with your shoulders relaxed and chin level.",
          "Slowly turn your head to look comfortably over your right shoulder.",
          "Pause for 2 seconds at your comfortable end-range, then return to center.",
          "Repeat smoothly on the left side with rhythmic breathing."
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/neck-rotation.mp4",
        safetyInstructions: "Do not tilt your head backwards or force movement through pain.",
        createdBy: therapist._id
      },
      {
        name: "Pendulum Stretch",
        description: "Passive gravity-assisted shoulder mobility exercise to reduce stiffness and improve joint space.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        defaultDurationSeconds: 300,
        instructions: [
          "Bend forward at the waist, supporting your torso with your unaffected arm on a table.",
          "Let your affected arm hang freely perpendicular to the floor.",
          "Gently initiate small, smooth circles using momentum from your torso.",
          "Perform 10 clockwise circles, then reverse direction counter-clockwise."
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/pendulum-stretch.mp4",
        safetyInstructions: "Do not swing aggressively; let gravity gently distract the joint.",
        createdBy: therapist._id
      },
      {
        name: "Wall Slides",
        description: "Upright scapular elevation drill to restore overhead reach mechanics and upward scapular rotation.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 12,
        defaultDurationSeconds: 360,
        instructions: [
          "Stand facing a wall with forearms in contact with the wall at a 90-degree angle.",
          "Slowly slide your forearms upward along the wall toward an overhead reach.",
          "Reach comfortably without shrugging your neck or arching your lower back.",
          "Slide back down in a controlled tempo to the starting position."
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/wall-slides.mp4",
        safetyInstructions: "Stop if you feel sharp pinching or impingement at the top of the reach.",
        createdBy: therapist._id
      },
      {
        name: "Shoulder External Rotation",
        description: "Targeted infraspinatus and teres minor rotator cuff strengthening to stabilize the glenohumeral joint.",
        targetBodyPart: "Shoulders",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 15,
        defaultDurationSeconds: 300,
        instructions: [
          "Stand upright with your elbow bent at 90 degrees and tucked snugly at your side.",
          "Rotate your forearm outward away from your torso while keeping the elbow pinned.",
          "Hold the end-range position for 2 seconds under control.",
          "Return slowly to the starting position across your abdomen."
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/shoulder-ext-rot.mp4",
        safetyInstructions: "Keep your elbow glued to your flank without swinging your elbow outward.",
        createdBy: therapist._id
      }
    ];

    await Exercise.insertMany(defaultExercises);
    console.log(`Successfully seeded ${defaultExercises.length} default exercises.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedExercises();
