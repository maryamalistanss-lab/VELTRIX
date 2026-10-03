require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const assert = require("assert");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
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

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "VELTRIX API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/patients", patientRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}`, error: "NOT_FOUND" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: "Internal server error", error: "SERVER_ERROR" });
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

const runTests = async () => {
  console.log("=================================================");
  console.log("VELTRIX Phase 4-7 Maryam Automated Test Suite");
  console.log("=================================================");

  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${BASE_URL}`);
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

  // Setup test users
  const timestamp = Date.now();
  const therapistA = await User.create({
    name: "Dr. Therapist A",
    email: `therapistA_${timestamp}@test.com`,
    password: "Password123!",
    role: "THERAPIST"
  });

  const therapistB = await User.create({
    name: "Dr. Therapist B",
    email: `therapistB_${timestamp}@test.com`,
    password: "Password123!",
    role: "THERAPIST"
  });

  const patientA = await User.create({
    name: "Patient A",
    email: `patientA_${timestamp}@test.com`,
    password: "Password123!",
    role: "PATIENT"
  });

  patientA.therapistNotes.push({
    therapistId: therapistA._id,
    note: "Test relationship for therapist access coverage"
  });
  await patientA.save();

  const patientB = await User.create({
    name: "Patient B",
    email: `patientB_${timestamp}@test.com`,
    password: "Password123!",
    role: "PATIENT"
  });

  const patientEmpty = await User.create({
    name: "Patient Empty",
    email: `patientEmpty_${timestamp}@test.com`,
    password: "Password123!",
    role: "PATIENT"
  });

  const tokenTherapistA = generateToken(therapistA);
  const tokenTherapistB = generateToken(therapistB);
  const tokenPatientA = generateToken(patientA);
  const tokenPatientB = generateToken(patientB);
  const tokenPatientEmpty = generateToken(patientEmpty);

  let createdExercise1;
  let createdSession1;
  console.log("\n--- GROUP 0: Registration & Login Authentication ---");

  await test("0. User registration hashes password and returns safe profile", async () => {
    const email = `auth_${timestamp}@test.com`;
    const res = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Auth Test User",
        email,
        password: "Password123!",
        role: "PATIENT"
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id);
    assert.strictEqual(res.data.data.email, email);
    assert.strictEqual(res.data.data.role, "PATIENT");
    assert.strictEqual(res.data.data.password, undefined);

    const user = await User.findById(res.data.data.id).select("+password");
    assert.ok(user);
    assert.notStrictEqual(user.password, "Password123!");
  });

  await test("0. Duplicate registration is rejected with 409", async () => {
    const email = `duplicate_${timestamp}@test.com`;

    const first = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate Test User",
        email,
        password: "Password123!",
        role: "PATIENT"
      })
    });

    assert.strictEqual(first.status, 201);

    const second = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate Test User",
        email,
        password: "Password123!",
        role: "PATIENT"
      })
    });

    assert.strictEqual(second.status, 409);
    assert.strictEqual(second.data.error, "CONFLICT");
  });

  await test("0. Login returns JWT and safe user profile", async () => {
    const email = `login_${timestamp}@test.com`;

    const registered = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Login Test User",
        email,
        password: "Password123!",
        role: "PATIENT"
      })
    });

    assert.strictEqual(registered.status, 201);

    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: "Password123!"
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token);
    assert.strictEqual(res.data.data.user.email, email);
    assert.strictEqual(res.data.data.user.role, "PATIENT");
    assert.strictEqual(res.data.data.user.password, undefined);
  });

  await test("0. Invalid login credentials are rejected with 401", async () => {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: `login_${timestamp}@test.com`,
        password: "WrongPassword123!"
      })
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.error, "UNAUTHORIZED");
  });

  await test("0. /api/auth/me returns the JWT-authenticated user", async () => {
    const email = `me_${timestamp}@test.com`;

    const registered = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Me Test User",
        email,
        password: "Password123!",
        role: "PATIENT"
      })
    });

    assert.strictEqual(registered.status, 201);

    const login = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: "Password123!"
      })
    });

    assert.strictEqual(login.status, 200);

    const res = await request("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${login.data.data.token}`
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.email, email);
    assert.strictEqual(res.data.data.role, "PATIENT");
    assert.strictEqual(res.data.data.password, undefined);
  });

  console.log("\n--- GROUP 1: Health & Authentication Boundaries ---");

  await test("1. Health check returns 200 OK", async () => {
    const res = await request("/api/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  await test("2. Unauthenticated request to /api/exercises is rejected with 401", async () => {
    const res = await request("/api/exercises");
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, "UNAUTHORIZED");
  });

  await test("3. Invalid token request is rejected with 401", async () => {
    const res = await request("/api/exercises", {
      headers: { Authorization: "Bearer invalid.token.value" }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  console.log("\n--- GROUP 2: Exercise CRUD & Validation ---");

  await test("4. Patient cannot CREATE an exercise (403 Forbidden)", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        name: `Illegal Exercise ${timestamp}`,
        description: "Should fail",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("5. Exercise validation rejects missing/invalid fields with 400", async () => {
    // Missing name
    let res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        description: "Missing name",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);

    // Invalid difficulty
    res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Invalid Diff ${timestamp}`,
        description: "Desc",
        targetBodyPart: "Knee",
        difficulty: "impossible",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);

    // Negative sets
    res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Negative Sets ${timestamp}`,
        description: "Desc",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"],
        defaultSets: -5
      })
    });
    assert.strictEqual(res.status, 400);

    // Empty instructions
    res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Empty Inst ${timestamp}`,
        description: "Desc",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: []
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("6. Therapist creates Exercise and createdBy is securely derived from JWT", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Seated Knee Flexion ${timestamp}`,
        description: "Gentle knee flexion for rehabilitation",
        targetBodyPart: "Knee",
        difficulty: "Beginner",
        defaultSets: 3,
        defaultReps: 12,
        defaultDurationSeconds: 60,
        instructions: ["Sit in a chair", "Gently bend knee backward", "Hold for 2 seconds"],
        demonstrationMedia: "https://example.com/demo.mp4",
        createdBy: patientA._id.toString() // Attempt to spoof createdBy
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id);
    assert.strictEqual(res.data.data.name, `Seated Knee Flexion ${timestamp}`);
    // Security check: createdBy must match Therapist A, NOT the spoofed patientA
    assert.strictEqual(res.data.data.createdBy.toString(), therapistA._id.toString());
    assert.strictEqual(res.data.data.difficulty, "beginner");
    assert.strictEqual(res.data.data.defaultSets, 3);
    assert.strictEqual(res.data.data.sets, 3);
    assert.strictEqual(res.data.data.defaultReps, 12);
    assert.strictEqual(res.data.data.repetitions, 12);

    createdExercise1 = res.data.data;
  });

  await test("7. Duplicate Exercise name is rejected with 400 Bad Request", async () => {
    const res = await request("/api/exercises", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Seated Knee Flexion ${timestamp}`,
        description: "Duplicate exercise name test",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test("8. Patient and Therapist can retrieve Exercise catalog from MongoDB", async () => {
    const resPatient = await request("/api/exercises", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resPatient.status, 200);
    assert.ok(Array.isArray(resPatient.data.data));
    assert.ok(resPatient.data.data.length >= 1);

    const resFilter = await request("/api/exercises?targetBodyPart=Knee&difficulty=beginner", {
      headers: { Authorization: `Bearer ${tokenTherapistA}` }
    });
    assert.strictEqual(resFilter.status, 200);
    assert.ok(resFilter.data.data.some((e) => e.id === createdExercise1.id));
  });

  await test("9. Retrieve single Exercise by ID (valid, missing, invalid)", async () => {
    // Valid ID
    const resValid = await request(`/api/exercises/${createdExercise1.id}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resValid.status, 200);
    assert.strictEqual(resValid.data.data.id, createdExercise1.id);

    // Non-existent valid ObjectId
    const fakeId = new mongoose.Types.ObjectId().toString();
    const resMissing = await request(`/api/exercises/${fakeId}`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resMissing.status, 404);
    assert.strictEqual(resMissing.data.error, "NOT_FOUND");

    // Invalid ObjectId format
    const resInvalid = await request("/api/exercises/not-a-valid-id", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resInvalid.status, 404);
    assert.strictEqual(resInvalid.data.error, "NOT_FOUND");
  });

  await test("10. Patient cannot UPDATE an exercise (403 Forbidden)", async () => {
    const res = await request(`/api/exercises/${createdExercise1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        name: "Hacked Name",
        description: "Hacked Desc",
        targetBodyPart: "Knee",
        difficulty: "beginner",
        instructions: ["Step 1"]
      })
    });
    assert.strictEqual(res.status, 403);
  });

  await test("11. Therapist updates Exercise and preserves original createdBy ownership", async () => {
    const res = await request(`/api/exercises/${createdExercise1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        name: `Seated Knee Flexion Updated ${timestamp}`,
        description: "Updated description with improved clarity",
        targetBodyPart: "Knee",
        difficulty: "intermediate",
        defaultSets: 4,
        defaultReps: 15,
        defaultDurationSeconds: 90,
        instructions: ["Step 1 modified", "Step 2 modified"],
        createdBy: patientB._id.toString() // Attempt to change creator
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.name, `Seated Knee Flexion Updated ${timestamp}`);
    assert.strictEqual(res.data.data.difficulty, "intermediate");
    assert.strictEqual(res.data.data.defaultSets, 4);
    assert.strictEqual(res.data.data.defaultReps, 15);
    // Security check: createdBy must remain Therapist A
    assert.strictEqual(res.data.data.createdBy.toString(), therapistA._id.toString());

    // Verify change in MongoDB
    const fromDb = await Exercise.findById(createdExercise1.id);
    assert.strictEqual(fromDb.name, `Seated Knee Flexion Updated ${timestamp}`);
    assert.strictEqual(fromDb.createdBy.toString(), therapistA._id.toString());
  });

  await test("12. Therapist deletes Exercise", async () => {
    // Create temporary exercise to delete
    const tempEx = await Exercise.create({
      name: `Temp Exercise to Delete ${timestamp}`,
      description: "Will be deleted",
      targetBodyPart: "Shoulder",
      difficulty: "beginner",
      instructions: ["Step 1"],
      createdBy: therapistA._id
    });

    // Patient cannot delete
    const resPatient = await request(`/api/exercises/${tempEx._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resPatient.status, 403);

    // Therapist deletes
    const resDelete = await request(`/api/exercises/${tempEx._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenTherapistA}` }
    });
    assert.strictEqual(resDelete.status, 200);
    assert.strictEqual(resDelete.data.success, true);

    // Verify it is gone from MongoDB
    const checkDb = await Exercise.findById(tempEx._id);
    assert.strictEqual(checkDb, null);
  });

  console.log("\n--- GROUP 3: ExerciseSession CRUD & Security ---");

  await test("13. Therapist cannot log a patient exercise session (403 Forbidden)", async () => {
    const res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenTherapistA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 3,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("14. Session creation validates required fields, pain bounds, and exercise existence", async () => {
    // Non-existent exercise ID
    const fakeExerciseId = new mongoose.Types.ObjectId().toString();
    let res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: fakeExerciseId,
        setsCompleted: 3,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.error, "NOT_FOUND");

    // Invalid pain score (> 10)
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 3,
        painBefore: 15,
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
        exerciseId: createdExercise1.id,
        setsCompleted: -1,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "moderate"
      })
    });
    assert.strictEqual(res.status, 400);

    // Invalid difficulty
    res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 3,
        painBefore: 4,
        painAfter: 2,
        perceivedDifficulty: "super-hard-unknown"
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("15. Patient creates Session 1 with secure patientId from JWT", async () => {
    const res = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 3,
        repsCompleted: 10,
        durationSeconds: 180,
        painBefore: 6,
        painAfter: 3,
        perceivedDifficulty: "Moderate",
        notes: "Felt strong during set 2",
        completionStatus: "completed",
        patientId: patientB._id.toString() // Spoof attempt
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id);
    // Security check: patientId must match Patient A, not spoofed Patient B
    assert.strictEqual(res.data.data.patientId.toString(), patientA._id.toString());
    assert.strictEqual(res.data.data.setsCompleted, 3);
    assert.strictEqual(res.data.data.painBefore, 6);
    assert.strictEqual(res.data.data.painAfter, 3);
    assert.strictEqual(res.data.data.perceivedDifficulty, "moderate");
    assert.strictEqual(res.data.data.difficulty, "moderate");
    assert.strictEqual(res.data.data.notes, "Felt strong during set 2");
    assert.strictEqual(res.data.data.completionStatus, "completed");

    createdSession1 = res.data.data;

    // Verify in MongoDB
    const sessionInDb = await ExerciseSession.findById(createdSession1.id);
    assert.ok(sessionInDb);
    assert.strictEqual(sessionInDb.patientId.toString(), patientA._id.toString());
    assert.strictEqual(sessionInDb.painBefore, 6);
    assert.strictEqual(sessionInDb.painAfter, 3);
  });

  await test("16. Patient creates additional sessions for progress tracking", async () => {
    // Session 2
    const res2 = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 3,
        repsCompleted: 12,
        durationSeconds: 200,
        painBefore: 5,
        painAfter: 2,
        perceivedDifficulty: "easy",
        completionStatus: "completed"
      })
    });
    assert.strictEqual(res2.status, 201);

    // Session 3
    const res3 = await request("/api/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        exerciseId: createdExercise1.id,
        setsCompleted: 4,
        repsCompleted: 12,
        durationSeconds: 240,
        painBefore: 4,
        painAfter: 1,
        perceivedDifficulty: "easy",
        completionStatus: "completed"
      })
    });
    assert.strictEqual(res3.status, 201);
  });

  await test("17. Patient updates existing session (PUT and PATCH)", async () => {
    // PUT update
    const resPut = await request(`/api/sessions/${createdSession1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        painAfter: 2,
        notes: "Updated note: knee felt significantly better after ice pack",
        completionStatus: "completed",
        setsCompleted: 3
      })
    });
    assert.strictEqual(resPut.status, 200);
    assert.strictEqual(resPut.data.data.painAfter, 2);
    assert.strictEqual(resPut.data.data.notes, "Updated note: knee felt significantly better after ice pack");

    // PATCH update
    const resPatch = await request(`/api/sessions/${createdSession1.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenPatientA}` },
      body: JSON.stringify({
        perceivedDifficulty: "easy"
      })
    });
    assert.strictEqual(resPatch.status, 200);
    assert.strictEqual(resPatch.data.data.perceivedDifficulty, "easy");

    // Verify in MongoDB
    const updatedInDb = await ExerciseSession.findById(createdSession1.id);
    assert.strictEqual(updatedInDb.painAfter, 2);
    assert.strictEqual(updatedInDb.perceivedDifficulty, "easy");
  });

  console.log("\n--- GROUP 4: Patient Session Isolation (MANDATORY) ---");

  await test("18. Patient B CANNOT access Patient A's session (403 Forbidden)", async () => {
    const res = await request(`/api/sessions/${createdSession1.id}`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  await test("19. Patient B CANNOT modify Patient A's session (403 Forbidden)", async () => {
    const res = await request(`/api/sessions/${createdSession1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenPatientB}` },
      body: JSON.stringify({
        painAfter: 10,
        notes: "Hacked by Patient B"
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, "FORBIDDEN");

    // Verify in DB that Patient A's session was NOT modified
    const dbCheck = await ExerciseSession.findById(createdSession1.id);
    assert.notStrictEqual(dbCheck.notes, "Hacked by Patient B");
  });

  await test("20. Patient B query to /api/sessions returns only Patient B sessions (zero data leakage)", async () => {
    const res = await request("/api/sessions", {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.data));
    assert.strictEqual(res.data.data.length, 0); // Patient B has logged 0 sessions
  });

  await test("21. Patient A query to /api/sessions returns Patient A's sessions only", async () => {
    const res = await request("/api/sessions", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 3);
    assert.ok(res.data.data.every((s) => s.patientId.toString() === patientA._id.toString()));
  });

  console.log("\n--- GROUP 5: Therapist Access & Scoping ---");

  await test("22. Therapist accesses patient session history", async () => {
    const res = await request(`/api/sessions/patient/${patientA._id}`, {
      headers: { Authorization: `Bearer ${tokenTherapistA}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 3);
  });

  await test("23. Patient attempting Therapist-only patient session route is rejected with 403", async () => {
    const res = await request(`/api/sessions/patient/${patientA._id}`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error, "FORBIDDEN");
  });

  console.log("\n--- GROUP 6: Progress API & Factual Analytics ---");

  await test("24. Patient A retrieves own progress (/api/sessions/progress)", async () => {
    const res = await request("/api/sessions/progress", {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(res.status, 200);
    const progress = res.data.data;

    assert.strictEqual(progress.totalSessions, 3);
    assert.strictEqual(progress.completedSessions, 3);
    assert.strictEqual(progress.completionRatePercentage, 100);
    assert.ok(progress.averagePainBefore > 0);
    assert.ok(progress.averagePainAfter > 0);
    assert.ok(progress.averagePainReduction >= 0);
    assert.ok(Array.isArray(progress.painTrend));
    assert.strictEqual(progress.painTrend.length, 3);
    assert.ok(progress.difficultyBreakdown);
    assert.ok(Array.isArray(progress.recentSessions));
  });

  await test("25. Therapist retrieves patient progress (/api/sessions/patient/:id/progress)", async () => {
    const res = await request(`/api/sessions/patient/${patientA._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenTherapistA}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.totalSessions, 3);
    assert.strictEqual(res.data.data.completedSessions, 3);
  });

  await test("26. Contract progress route /api/patients/:id/progress", async () => {
    // Therapist accesses
    const resTherapist = await request(`/api/patients/${patientA._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenTherapistA}` }
    });
    assert.strictEqual(resTherapist.status, 200);
    assert.strictEqual(resTherapist.data.data.totalSessions, 3);

    // Patient A accesses own
    const resPatientA = await request(`/api/patients/${patientA._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenPatientA}` }
    });
    assert.strictEqual(resPatientA.status, 200);

    // Patient B attempts to access Patient A's progress -> 403 Forbidden
    const resPatientB = await request(`/api/patients/${patientA._id}/progress`, {
      headers: { Authorization: `Bearer ${tokenPatientB}` }
    });
    assert.strictEqual(resPatientB.status, 403);
  });

  await test("27. Empty progress returns clean zero-data structure without crashing", async () => {
    const res = await request("/api/sessions/progress", {
      headers: { Authorization: `Bearer ${tokenPatientEmpty}` }
    });
    assert.strictEqual(res.status, 200);
    const data = res.data.data;
    assert.strictEqual(data.totalSessions, 0);
    assert.strictEqual(data.completedSessions, 0);
    assert.strictEqual(data.averagePainBefore, 0);
    assert.strictEqual(data.averagePainAfter, 0);
    assert.strictEqual(data.averagePainReduction, 0);
    assert.deepStrictEqual(data.painTrend, []);
    assert.deepStrictEqual(data.recentSessions, []);
  });

  console.log("\n--- GROUP 7: Malformed IDs & Error Format Consistency ---");

  await test("28. Malformed IDs across all endpoints return 404 NOT_FOUND without crashing", async () => {
    const endpoints = [
      "/api/exercises/not-an-id",
      "/api/sessions/not-an-id",
      "/api/sessions/patient/not-an-id",
      "/api/sessions/patient/not-an-id/progress",
      "/api/patients/not-an-id/progress"
    ];

    for (const ep of endpoints) {
      const res = await request(ep, {
        headers: { Authorization: `Bearer ${tokenTherapistA}` }
      });
      assert.strictEqual(res.status, 404, `Endpoint ${ep} should return 404`);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.error, "NOT_FOUND");
    }
  });

  console.log("\n--- GROUP 8: Database Regression & Integrity ---");

  await test("29. User and Exercise records remain intact in MongoDB", async () => {
    const uCount = await User.countDocuments();
    assert.ok(uCount >= 5);
    const eCount = await Exercise.countDocuments();
    assert.ok(eCount >= 1);
    const sCount = await ExerciseSession.countDocuments();
    assert.ok(sCount >= 3);
  });

  console.log("\n=================================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  server.close();
  await mongoose.disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  if (server) server.close();
  process.exit(1);
});
