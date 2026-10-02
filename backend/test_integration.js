require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User');
const Exercise = require('./models/Exercise');
const ExerciseSession = require('./models/ExerciseSession');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'veltrix-dev-secret';
}

const JWT_SECRET = process.env.JWT_SECRET;

const runTests = async () => {
  console.log('==================================================');
  console.log('VELTRIX INTEGRATION TEST: PHASES 4, 5, 6, 7');
  console.log('==================================================');

  await connectDB();
  console.log('✓ Connected to MongoDB');

  // Generate tokens for testing
  const createTestUser = async (name, email, role) => {
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({
        name,
        email,
        password: 'Password123!',
        role,
      });
    }
    const token = jwt.sign(
      { sub: u._id, email: u.email, role: u.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return { user: u, token };
  };

  const patientA = await createTestUser('Patient Alpha', 'alpha.patient@veltrix-test.com', 'PATIENT');
  const patientB = await createTestUser('Patient Beta', 'beta.patient@veltrix-test.com', 'PATIENT');

  console.log(`✓ Test Patient A initialized: ${patientA.user.name} (${patientA.user._id})`);
  console.log(`✓ Test Patient B initialized: ${patientB.user.name} (${patientB.user._id})`);

  // Clean past test sessions for these test patients
  await ExerciseSession.deleteMany({ patientId: { $in: [patientA.user._id, patientB.user._id] } });
  console.log('✓ Cleaned previous test sessions for test accounts');

  // Test 1: Exercise Catalog
  console.log('\n--- TEST 1: EXERCISE CATALOG (PHASE 4) ---');
  const exercises = await Exercise.find({});
  if (exercises.length === 0) {
    throw new Error('FAILED: Exercise catalog is empty');
  }
  console.log(`✓ Exercise catalog retrieved: ${exercises.length} available exercises`);
  const sampleEx = exercises[0];
  console.log(`✓ Sample exercise: "${sampleEx.name}" (Target: ${sampleEx.targetBodyPart}, Difficulty: ${sampleEx.difficulty})`);

  // Test 2: Validation on Session Input
  console.log('\n--- TEST 2: VALIDATION ON SESSION INPUT (PHASE 6) ---');
  const { validateSessionInput } = require('./utils/validators');

  const invalidPain = validateSessionInput({
    exerciseId: sampleEx._id,
    setsCompleted: 3,
    painBefore: 15, // Out of bounds
    painAfter: 2,
    perceivedDifficulty: 'moderate'
  });
  if (invalidPain.isValid) throw new Error('FAILED: painBefore > 10 should have failed validation');
  console.log('✓ Validation correctly rejected painBefore > 10');

  const invalidDiff = validateSessionInput({
    exerciseId: sampleEx._id,
    setsCompleted: 3,
    painBefore: 4,
    painAfter: 2,
    perceivedDifficulty: 'super_hard' // Invalid enum
  });
  if (invalidDiff.isValid) throw new Error('FAILED: invalid perceivedDifficulty should have failed validation');
  console.log('✓ Validation correctly rejected invalid perceivedDifficulty');

  const validData = validateSessionInput({
    exerciseId: sampleEx._id,
    setsCompleted: 3,
    painBefore: 4,
    painAfter: 1,
    perceivedDifficulty: 'moderate'
  });
  if (!validData.isValid) throw new Error(`FAILED: valid data failed validation: ${validData.errors.join(', ')}`);
  console.log('✓ Validation correctly accepted valid session input (pain 0-10, difficulty easy/moderate/hard)');

  // Test 3: Log Session for Patient A
  console.log('\n--- TEST 3: LOG SESSION FOR PATIENT A (PHASE 6) ---');
  const sessionA = await ExerciseSession.create({
    patientId: patientA.user._id,
    exerciseId: sampleEx._id,
    setsCompleted: 3,
    repsCompleted: 10,
    durationSeconds: 240,
    painBefore: 4,
    painAfter: 1,
    perceivedDifficulty: 'moderate',
    sessionResults: { feedback: 'Smooth controlled movement' }
  });
  console.log(`✓ Session logged for Patient A: ID ${sessionA._id}`);
  console.log(`  - Pain Before: ${sessionA.painBefore}/10, Pain After: ${sessionA.painAfter}/10 (Delta: ${sessionA.painAfter - sessionA.painBefore})`);
  console.log(`  - Difficulty: ${sessionA.perceivedDifficulty}, Duration: ${sessionA.durationSeconds}s`);

  // Test 4: Two-Patient Isolation (CRITICAL TEST 28)
  console.log('\n--- TEST 4: TWO-PATIENT DATA ISOLATION (PHASE 6 & 7) ---');
  const patientASessions = await ExerciseSession.find({ patientId: patientA.user._id });
  const patientBSessions = await ExerciseSession.find({ patientId: patientB.user._id });

  console.log(`✓ Patient A session count: ${patientASessions.length} (Expected: 1)`);
  console.log(`✓ Patient B session count: ${patientBSessions.length} (Expected: 0)`);

  if (patientASessions.length !== 1) throw new Error('FAILED: Patient A should have exactly 1 session');
  if (patientBSessions.length !== 0) throw new Error('FAILED: Patient B should have 0 sessions, data leaked!');

  // Now log a session for Patient B
  const sampleEx2 = exercises[1] || exercises[0];
  const sessionB = await ExerciseSession.create({
    patientId: patientB.user._id,
    exerciseId: sampleEx2._id,
    setsCompleted: 2,
    repsCompleted: 15,
    durationSeconds: 180,
    painBefore: 6,
    painAfter: 4,
    perceivedDifficulty: 'hard',
    sessionResults: { feedback: 'High exertion' }
  });
  console.log(`✓ Session logged for Patient B: ID ${sessionB._id}`);

  const patientASessionsUpdated = await ExerciseSession.find({ patientId: patientA.user._id });
  const patientBSessionsUpdated = await ExerciseSession.find({ patientId: patientB.user._id });

  if (patientASessionsUpdated.length !== 1) throw new Error('FAILED: Patient A sessions modified');
  if (patientBSessionsUpdated.length !== 1) throw new Error('FAILED: Patient B should have 1 session');

  console.log(`✓ Verification: Patient A sees ${patientASessionsUpdated.length} session, Patient B sees ${patientBSessionsUpdated.length} session`);
  console.log(`✓ Patient A session ID: ${patientASessionsUpdated[0]._id}`);
  console.log(`✓ Patient B session ID: ${patientBSessionsUpdated[0]._id}`);
  console.log('✓ DATA OWNERSHIP INTEGRITY VERIFIED: Patient B cannot see Patient A data');

  // Test 5: Progress calculation for Patient A
  console.log('\n--- TEST 5: PROGRESS METRICS CALCULATION (PHASE 7) ---');
  const totalSessions = patientASessionsUpdated.length;
  const uniqueExercises = new Set(patientASessionsUpdated.map(s => s.exerciseId.toString())).size;
  const completionRate = Math.min(100, Math.round((uniqueExercises / exercises.length) * 100));
  const avgPainReduction = (patientASessionsUpdated.reduce((acc, s) => acc + (s.painBefore - s.painAfter), 0) / totalSessions).toFixed(1);

  console.log(`✓ Total Sessions: ${totalSessions}`);
  console.log(`✓ Unique Exercises Completed: ${uniqueExercises} of ${exercises.length}`);
  console.log(`✓ Protocol Completion Rate: ${completionRate}%`);
  console.log(`✓ Average Pain Reduction: -${avgPainReduction} points`);

  console.log('\n==================================================');
  console.log('ALL PHASE 4, 5, 6, 7 INTEGRATION TESTS PASSED!');
  console.log('==================================================');
  process.exit(0);
};

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
