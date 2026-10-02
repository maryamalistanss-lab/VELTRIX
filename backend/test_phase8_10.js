require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const assert = require("assert");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const patientRoutes = require("./routes/patientRoutes");

const User = require("./models/User");
const Exercise = require("./models/Exercise");
const ExerciseSession = require("./models/ExerciseSession");
const generateToken = require("./utils/generateToken");

const app = express();
app.use(cors());
app.use(express.json());

// Mount all application routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "VELTRIX API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/patients", patientRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: "NOT_FOUND"
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: "SERVER_ERROR"
  });
});

let server;
let BASE_URL;

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, data };
};

const runPhase8To10Verification = async () => {
  console.log("==================================================================");
  console.log("VELTRIX PHASE 8–10: PERSON 4 (MARYAM) COMPREHENSIVE VERIFICATION");
  console.log("==================================================================");

  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`Test server active at ${BASE_URL}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  };

  const ts = Date.now();

  // Create test actors
  const therapist1 = await User.create({
    name: "Dr. Maryam Therapist",
    email: `maryam_therapist_${ts}@veltrix.test`,
    password: "Password123!",
    role: "THERAPIST"
  });

  const patientAlpha = await User.create({
    name: "Patient Alpha (A)",
    email: `patient_alpha_${ts}@veltrix.test`,
    password: "Password123!",
    role: "PATIENT"
  });

  const patientBeta = await User.create({
    name: "Patient Beta (B)",
    email: `patient_beta_${ts}@veltrix.test`,
    password: "Password123!",
    role: "PATIENT"
  });

  const patientGammaEmpty = await User.create({
    name: "Patient Gamma (Zero Sessions)",
    email: `patient_gamma_${ts}@veltrix.test`,
    password: "Password123!",
    role: "PATIENT"
  });

  const tokenTherapist = generateToken(therapist1);
  const tokenPatientA = generateToken(patientAlpha);
  const tokenPatientB = generateToken(patientBeta);
  const tokenPatientGamma = generateToken(patientGammaEmpty);

  let testExerciseId;
  let sessionA1Id;
  let sessionB1Id;

  console.log("\n--- PART 1: EXERCISE API, VALIDATION & PERSISTENCE ---");

  await test("1.1 Patient is forbidden from creating exercises (403)", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        name: `Illegal Exercise ${ts}`,
        description: "Should be forbidden",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("1.2 Exercise validation rejects missing fields and invalid payloads (400)", async () => {
    // Missing required name
    let res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        description: "Missing name",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);

    // Invalid difficulty value
    res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `Invalid Diff ${ts}`,
        description: "Valid desc",
        targetBodyPart: "Knee",
        difficulty: "super-extreme",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);

    // Empty instructions array
    res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `Empty Instructions ${ts}`,
        description: "Valid desc",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: []
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("1.3 Therapist creates valid exercise; createdBy strictly bound to authenticated therapist", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `Clinical Quadriceps Extension ${ts}`,
        description: "Targeted quad strengthening with progressive resistance",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 12,
        defaultDurationSeconds: 120,
        instructions: [
          "Sit upright with back firmly against chair",
          "Extend right knee slowly until fully straight",
          "Hold extension for 2 full seconds",
          "Lower leg slowly under control"
        ],
        demonstrationMedia: "https://assets.veltrix.app/exercises/quad-ext.mp4",
        safetyInstructions: "Stop if sharp patellar pain occurs",
        createdBy: patientAlpha._id.toString() // Spoofed createdBy must be ignored
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id);
    assert.strictEqual(res.data.data.name, `Clinical Quadriceps Extension ${ts}`);
    // Ownership check: must be therapist1 ID
    assert.strictEqual(res.data.data.createdBy.toString(), therapist1._id.toString());
    assert.strictEqual(res.data.data.sets, 3);
    assert.strictEqual(res.data.data.repetitions, 12);

    testExerciseId = res.data.data.id;

    // Verify persistence in MongoDB
    const persisted = await Exercise.findById(testExerciseId);
    assert.ok(persisted);
    assert.strictEqual(persisted.name, `Clinical Quadriceps Extension ${ts}`);
    assert.strictEqual(persisted.createdBy.toString(), therapist1._id.toString());
  });

  await test("1.4 Duplicate exercise name returns 400 Bad Request", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `Clinical Quadriceps Extension ${ts}`,
        description: "Duplicate test",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("1.5 Patient & Therapist can list and retrieve exercises from MongoDB", async () => {
    // List exercises
    const resList = await request("/api/exercises", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resList.status, 200);
    assert.ok(Array.isArray(resList.data.data));
    assert.ok(resList.data.data.some((e) => e.id === testExerciseId));

    // Get exercise by ID
    const resGet = await request(`/api/exercises/${testExerciseId}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.data.data.id, testExerciseId);
    assert.strictEqual(resGet.data.data.targetBodyPart, "Knee");

    // Invalid & non-existent IDs return 404
    const res404 = await request(`/api/exercises/${new mongoose.Types.ObjectId()}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res404.status, 404);

    const resInvalidId = await request("/api/exercises/invalid-id-format", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resInvalidId.status, 404);
  });

  await test("1.6 Therapist updates exercise; preserves createdBy ownership; Patient cannot update", async () => {
    // Patient forbidden
    const resPat = await request(`/api/exercises/${testExerciseId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        name: "Hacked",
        description: "Desc",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(resPat.status, 403);

    // Therapist updates
    const resTher = await request(`/api/exercises/${testExerciseId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `Clinical Quadriceps Extension Updated ${ts}`,
        description: "Updated description",
        targetBodyPart: "Knee",
        difficulty: "intermediate",
        defaultSets: 4,
        defaultReps: 15,
        defaultDurationSeconds: 150,
        instructions: ["Updated step 1", "Updated step 2"],
        createdBy: patientBeta._id.toString() // Spoofed createdBy
      })
    });

    assert.strictEqual(resTher.status, 200);
    assert.strictEqual(resTher.data.data.name, `Clinical Quadriceps Extension Updated ${ts}`);
    assert.strictEqual(resTher.data.data.difficulty, "intermediate");
    assert.strictEqual(resTher.data.data.sets, 4);
    assert.strictEqual(resTher.data.data.createdBy.toString(), therapist1._id.toString());
  });

  console.log("\n--- PART 2: EXERCISESESSION API, VALIDATION & PERSISTENCE ---");

  await test("2.1 Therapist is forbidden from logging patient sessions (403)", async () => {
    const res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        painBefore: 3,
        painAfter: 1,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("2.2 Session creation validates pain range (0-10), non-negative values, difficulty enum, and exercise existence", async () => {
    // Non-existent exercise
    let res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: new mongoose.Types.ObjectId().toString(),
        setsCompleted: 3,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 404);

    // Pain > 10
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        painBefore: 12,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 400);

    // Pain < 0
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        painBefore: -1,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 400);

    // Negative sets completed
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: -2,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 400);

    // Invalid difficulty enum
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "brutal"
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("2.3 Patient A logs Session 1; patientId is strictly determined by JWT; persisted in MongoDB", async () => {
    const res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        repsCompleted: 12,
        durationSeconds: 180,
        painBefore: 6,
        painAfter: 3,
        perceivedDifficulty: "moderate",
        completionStatus: "completed",
        notes: "Session 1 for Patient A: Felt slight stiffness in initial set",
        patientId: patientBeta._id.toString() // Spoofed patientId must be ignored!
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id);
    // Security check: Must belong to Patient Alpha, NOT spoofed Patient Beta
    assert.strictEqual(res.data.data.patientId.toString(), patientAlpha._id.toString());
    assert.strictEqual(res.data.data.setsCompleted, 3);
    assert.strictEqual(res.data.data.repetitionsCompleted, 12);
    assert.strictEqual(res.data.data.painBefore, 6);
    assert.strictEqual(res.data.data.painAfter, 3);
    assert.strictEqual(res.data.data.difficulty, "moderate");
    assert.strictEqual(res.data.data.completionStatus, "completed");

    sessionA1Id = res.data.data.id;

    // Direct MongoDB persistence verification
    const inDb = await ExerciseSession.findById(sessionA1Id);
    assert.ok(inDb);
    assert.strictEqual(inDb.patientId.toString(), patientAlpha._id.toString());
    assert.strictEqual(inDb.painBefore, 6);
    assert.strictEqual(inDb.painAfter, 3);
  });

  await test("2.4 Patient A logs Session 2 & Session 3 to establish real longitudinal progress", async () => {
    const res2 = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 3,
        repsCompleted: 12,
        durationSeconds: 190,
        painBefore: 5,
        painAfter: 2,
        perceivedDifficulty: "moderate",
        completionStatus: "completed",
        notes: "Session 2: Improved knee extension range"
      })
    });
    assert.strictEqual(res2.status, 201);

    const res3 = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 4,
        repsCompleted: 15,
        durationSeconds: 220,
        painBefore: 4,
        painAfter: 1,
        perceivedDifficulty: "easy",
        completionStatus: "completed",
        notes: "Session 3: Zero pain post-exercise cooldown"
      })
    });
    assert.strictEqual(res3.status, 201);
  });

  await test("2.5 Patient B logs Session 1 for Patient B; stored cleanly in MongoDB", async () => {
    const res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientB}` },
      body: JSON.stringify({
        exerciseId: testExerciseId,
        setsCompleted: 2,
        repsCompleted: 8,
        durationSeconds: 120,
        painBefore: 7,
        painAfter: 5,
        perceivedDifficulty: "hard",
        completionStatus: "completed",
        notes: "Session 1 for Patient B: Higher pain reported",
        patientId: patientAlpha._id.toString() // Spoofed patientId must be ignored!
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.patientId.toString(), patientBeta._id.toString());
    assert.strictEqual(res.data.data.painBefore, 7);
    assert.strictEqual(res.data.data.painAfter, 5);

    sessionB1Id = res.data.data.id;
  });

  console.log("\n--- PART 3: PATIENT OWNERSHIP & PATIENT A/B ISOLATION ---");

  await test("3.1 Patient A query to /api/sessions returns ONLY Patient A sessions (count: 3)", async () => {
    const res = await request("/api/sessions", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 3);
    assert.ok(res.data.data.every((s) => s.patientId.toString() === patientAlpha._id.toString()));
  });

  await test("3.2 Patient B query to /api/sessions returns ONLY Patient B sessions (count: 1, zero leakage of A)", async () => {
    const res = await request("/api/sessions", {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 1);
    assert.strictEqual(res.data.data[0].id, sessionB1Id);
    assert.strictEqual(res.data.data[0].patientId.toString(), patientBeta._id.toString());
  });

  await test("3.3 Patient A CANNOT read Patient B private session by ID (403 Forbidden)", async () => {
    const res = await request(`/api/sessions/${sessionB1Id}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("3.4 Patient B CANNOT read Patient A private session by ID (403 Forbidden)", async () => {
    const res = await request(`/api/sessions/${sessionA1Id}`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("3.5 Patient A CANNOT modify Patient B session (403 Forbidden); session unchanged in MongoDB", async () => {
    const res = await request(`/api/sessions/${sessionB1Id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        painAfter: 0,
        notes: "Attempted malicious modification by Patient A"
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");

    // Verify in MongoDB that Patient B's session was unaffected
    const checkDb = await ExerciseSession.findById(sessionB1Id);
    assert.strictEqual(checkDb.painAfter, 5);
    assert.notStrictEqual(checkDb.notes, "Attempted malicious modification by Patient A");
  });

  await test("3.6 Patient B CANNOT modify Patient A session (403 Forbidden); session unchanged in MongoDB", async () => {
    const res = await request(`/api/sessions/${sessionA1Id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenPatientB}` },
      body: JSON.stringify({
        painAfter: 10,
        notes: "Attempted malicious modification by Patient B"
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");

    // Verify in MongoDB that Patient A's session was unaffected
    const checkDb = await ExerciseSession.findById(sessionA1Id);
    assert.strictEqual(checkDb.painAfter, 3);
    assert.notStrictEqual(checkDb.notes, "Attempted malicious modification by Patient B");
  });

  await test("3.7 Patient A can legitimately update their OWN session", async () => {
    const res = await request(`/api/sessions/${sessionA1Id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        painAfter: 2,
        notes: "Legitimate update by Patient A: Pain decreased to 2 after icing"
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.painAfter, 2);
    assert.strictEqual(res.data.data.notes, "Legitimate update by Patient A: Pain decreased to 2 after icing");

    const inDb = await ExerciseSession.findById(sessionA1Id);
    assert.strictEqual(inDb.painAfter, 2);
  });

  console.log("\n--- PART 4: PROGRESS API & FACTUAL REHABILITATION ANALYTICS ---");

  await test("4.1 Patient A progress (/api/sessions/progress) aggregates REAL MongoDB session records", async () => {
    const res = await request("/api/sessions/progress", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    const prog = res.data.data;
    assert.strictEqual(prog.patientId.toString(), patientAlpha._id.toString());
    assert.strictEqual(prog.totalSessions, 3);
    assert.strictEqual(prog.completedSessions, 3);
    assert.strictEqual(prog.completionRatePercentage, 100);

    // Patient A pain scores:
    // Session 1: before 6, after 2 (updated) -> delta -4
    // Session 2: before 5, after 2 -> delta -3
    // Session 3: before 4, after 1 -> delta -3
    // avgBefore = (6+5+4)/3 = 5.0
    // avgAfter = (2+2+1)/3 = 1.7
    // avgReduction = 5.0 - 1.7 = 3.3
    assert.strictEqual(prog.averagePainBefore, 5.0);
    assert.strictEqual(prog.averagePainAfter, 1.7);
    assert.strictEqual(prog.averagePainReduction, 3.3);

    // Pain trend array
    assert.strictEqual(prog.painTrend.length, 3);
    assert.strictEqual(prog.painTrend[0].painBefore, 6);
    assert.strictEqual(prog.painTrend[0].painAfter, 2);

    // Difficulty breakdown: 2 moderate, 1 easy
    assert.strictEqual(prog.difficultyBreakdown.moderate, 2);
    assert.strictEqual(prog.difficultyBreakdown.easy, 1);
    assert.strictEqual(prog.difficultyBreakdown.hard, 0);

    // Recent sessions
    assert.strictEqual(prog.recentSessions.length, 3);
  });

  await test("4.2 Patient B cannot access Patient A progress via /api/patients/:id/progress (403 Forbidden)", async () => {
    const res = await request(`/api/patients/${patientAlpha._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("4.3 Patient Gamma with zero sessions returns clean zeroed metrics without crashing", async () => {
    const res = await request("/api/sessions/progress", {
      headers: { Authorization: `Bearer ${tokenPatientGamma}` }
    });
    assert.strictEqual(res.status, 200);
    const data = res.data.data;
    assert.strictEqual(data.totalSessions, 0);
    assert.strictEqual(data.completedSessions, 0);
    assert.strictEqual(data.completionRatePercentage, 0);
    assert.strictEqual(data.averagePainBefore, 0);
    assert.strictEqual(data.averagePainAfter, 0);
    assert.strictEqual(data.averagePainReduction, 0);
    assert.deepStrictEqual(data.painTrend, []);
    assert.deepStrictEqual(data.recentSessions, []);
  });

  console.log("\n--- PART 5: THERAPIST CLINICAL MONITORING & SCOPING ---");

  await test("5.1 Therapist reviews Patient A session logs (/api/sessions/patient/:patientId)", async () => {
    const res = await request(`/api/sessions/patient/${patientAlpha._id}`, {
      headers: { Authorization: `Bearer ${tokenTherapist}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 3);
    assert.ok(res.data.data.every((s) => s.patientId.toString() === patientAlpha._id.toString()));
  });

  await test("5.2 Therapist reviews Patient A progress analytics (/api/sessions/patient/:id/progress)", async () => {
    const res = await request(`/api/sessions/patient/${patientAlpha._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenTherapist}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.totalSessions, 3);
    assert.strictEqual(res.data.data.averagePainReduction, 3.3);
  });

  await test("5.3 Patient forbidden from accessing therapist-only patient session route (403)", async () => {
    const res = await request(`/api/sessions/patient/${patientAlpha._id}`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  console.log("\n--- PART 6: END-TO-END CLINICAL WORKFLOW ---");

  await test("6.1 Complete End-to-End Flow: Therapist Authoring -> Patient Execution -> Session Persistence -> Real Progress", async () => {
    // Step 1: Therapist registers new clinical exercise
    const exRes = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapist}` },
      body: JSON.stringify({
        name: `E2E Shoulder Rotator Cuff Protocol ${ts}`,
        description: "Full rotation protocol for rotator cuff rehabilitation",
        targetBodyPart: "Shoulder",
        difficulty: "beginner",
        defaultSets: 3,
        defaultReps: 10,
        instructions: ["Anchor band at elbow height", "Slowly rotate forearm outward", "Hold and return smoothly"]
      })
    });
    assert.strictEqual(exRes.status, 201);
    const e2eExerciseId = exRes.data.data.id;

    // Step 2: Patient logs in and fetches real exercise from catalog
    const fetchRes = await request(`/api/exercises/${e2eExerciseId}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(fetchRes.status, 200);
    assert.strictEqual(fetchRes.data.data.name, `E2E Shoulder Rotator Cuff Protocol ${ts}`);

    // Step 3: Patient executes and logs session
    const logRes = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: e2eExerciseId,
        setsCompleted: 3,
        repsCompleted: 10,
        durationSeconds: 160,
        painBefore: 5,
        painAfter: 2,
        perceivedDifficulty: "moderate",
        completionStatus: "completed",
        notes: "E2E test session completion"
      })
    });
    assert.strictEqual(logRes.status, 201);
    const e2eSessionId = logRes.data.data.id;

    // Step 4: Verify session in MongoDB
    const sessionInDb = await ExerciseSession.findById(e2eSessionId);
    assert.ok(sessionInDb);
    assert.strictEqual(sessionInDb.patientId.toString(), patientAlpha._id.toString());
    assert.strictEqual(sessionInDb.exerciseId.toString(), e2eExerciseId);

    // Step 5: Check session history reflects the new session
    const historyRes = await request("/api/sessions", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(historyRes.status, 200);
    assert.strictEqual(historyRes.data.data.length, 4); // 3 prior + 1 new

    // Step 6: Progress API reflects the updated real session data
    const progRes = await request("/api/sessions/progress", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(progRes.status, 200);
    assert.strictEqual(progRes.data.data.totalSessions, 4);
    assert.strictEqual(progRes.data.data.completedSessions, 4);
  });

  console.log("\n==================================================================");
  console.log(`Phase 8–10 Verification Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  server.close();
  await mongoose.disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase8To10Verification().catch((err) => {
  console.error("Verification execution encountered an unhandled error:", err);
  if (server) server.close();
  process.exit(1);
});
