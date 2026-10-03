/**
 * Automated Unit Test Suite for VELTRIX Phase 11 Camera Mode Engine
 * Verifies angle math, landmark visibility, strategy definitions, movement state machine, debouncing, and tracking loss.
 */

const assert = require('assert');

// 1. Mock landmark calculator & movement engine imports in Node environment
function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return null;
  if (typeof p1.x !== 'number' || typeof p2.x !== 'number' || typeof p3.x !== 'number') return null;
  if (typeof p1.y !== 'number' || typeof p2.y !== 'number' || typeof p3.y !== 'number') return null;

  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;

  if ((dx1 === 0 && dy1 === 0) || (dx2 === 0 && dy2 === 0)) {
    return null;
  }

  const radians = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  if (isNaN(angle)) return null;

  return Math.round(angle);
}

function areLandmarksVisible(landmarks, indices, minVisibility = 0.45) {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return false;
  if (!Array.isArray(indices) || indices.length === 0) return true;

  for (const idx of indices) {
    const lm = landmarks[idx];
    if (!lm) return false;
    if (typeof lm.visibility === 'number' && lm.visibility < minVisibility) {
      return false;
    }
  }

  return true;
}

const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

const SQUAT_CONFIG = {
  key: 'squat',
  name: 'Squat',
  isSupported: true,
  requiredLandmarks: [23, 25, 27, 24, 26, 28],
  getPrimaryAngle: (landmarks) => {
    const leftKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
    const rightKnee = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
    if (leftKnee !== null && rightKnee !== null) return Math.round((leftKnee + rightKnee) / 2);
    return leftKnee !== null ? leftKnee : rightKnee;
  },
  startThreshold: 155,
  peakThreshold: 115,
  returnThreshold: 155,
  guidance: {
    start: 'Stand tall',
    moving: 'Squat down',
    peak: 'Good depth',
    returning: 'Push up',
  },
  repositionMessage: 'Step back into view',
};

class MovementEngine {
  constructor(config) {
    this.config = config;
    this.phase = 'POSITIONING';
    this.repsCompleted = 0;
    this.currentAngle = null;
    this.hasPeakReached = false;
    this.lastRepTimestamp = 0;
    this.minRepIntervalMs = 1200;
    this.feedback = '';
    this.isVisible = false;
  }

  processFrame(landmarks) {
    let repJustCompleted = false;

    if (!this.config || !this.config.isSupported) {
      return { phase: 'POSITIONING', repsCompleted: this.repsCompleted, currentAngle: null, feedback: 'Unsupported', isVisible: false, repJustCompleted: false };
    }

    const visible = areLandmarksVisible(landmarks, this.config.requiredLandmarks, 0.45);
    this.isVisible = visible;

    if (!visible) {
      this.phase = 'POSITIONING';
      this.hasPeakReached = false;
      this.feedback = this.config.repositionMessage || 'Landmarks unclear.';
      return { phase: this.phase, repsCompleted: this.repsCompleted, currentAngle: this.currentAngle, feedback: this.feedback, isVisible: false, repJustCompleted: false };
    }

    const angle = this.config.getPrimaryAngle(landmarks);
    this.currentAngle = angle;

    if (angle === null || isNaN(angle)) {
      return { phase: this.phase, repsCompleted: this.repsCompleted, currentAngle: null, feedback: 'Invalid angle', isVisible: true, repJustCompleted: false };
    }

    const { startThreshold, peakThreshold, returnThreshold, guidance } = this.config;
    const now = Date.now();
    const isHighToLow = startThreshold > peakThreshold;

    if (isHighToLow) {
      if (this.phase === 'POSITIONING') {
        if (angle >= startThreshold - 10) {
          this.phase = 'READY';
          this.feedback = guidance.start;
        }
      } else if (this.phase === 'READY') {
        if (angle < startThreshold - 8) {
          this.phase = 'IN_MOTION';
          this.feedback = guidance.moving;
        }
      } else if (this.phase === 'IN_MOTION') {
        if (angle <= peakThreshold) {
          this.phase = 'PEAK';
          this.hasPeakReached = true;
          this.feedback = guidance.peak;
        }
      } else if (this.phase === 'PEAK') {
        if (angle > peakThreshold + 10) {
          this.phase = 'RETURNING';
          this.feedback = guidance.returning;
        }
      } else if (this.phase === 'RETURNING') {
        if (angle >= returnThreshold) {
          if (now - this.lastRepTimestamp > this.minRepIntervalMs && this.hasPeakReached) {
            this.repsCompleted += 1;
            this.lastRepTimestamp = now;
            repJustCompleted = true;
            this.feedback = `Repetition ${this.repsCompleted} complete!`;
          }
          this.phase = 'READY';
          this.hasPeakReached = false;
        }
      }
    }

    return {
      phase: this.phase,
      repsCompleted: this.repsCompleted,
      currentAngle: this.currentAngle,
      feedback: this.feedback,
      isVisible: true,
      repJustCompleted,
    };
  }
}

// ================= TEST SUITE EXECUTION =================
console.log('====================================================');
console.log('VELTRIX PHASE 11: CAMERA MODE ENGINE AUTOMATED SUITE');
console.log('====================================================');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✕ ${name}:`, err.message);
    testsFailed++;
  }
}

// 1. Angle Math & Edge Cases
runTest('1.1 Calculate 90-degree right angle (Hip-Knee-Ankle)', () => {
  const hip = { x: 0.5, y: 0.2, visibility: 0.9 };
  const knee = { x: 0.5, y: 0.5, visibility: 0.9 };
  const ankle = { x: 0.8, y: 0.5, visibility: 0.9 };
  const angle = calculateAngle(hip, knee, ankle);
  assert.strictEqual(angle, 90);
});

runTest('1.2 Calculate 180-degree straight line', () => {
  const p1 = { x: 0.5, y: 0.1, visibility: 0.9 };
  const p2 = { x: 0.5, y: 0.5, visibility: 0.9 };
  const p3 = { x: 0.5, y: 0.9, visibility: 0.9 };
  const angle = calculateAngle(p1, p2, p3);
  assert.strictEqual(angle, 180);
});

runTest('1.3 Handle missing or null landmarks gracefully', () => {
  assert.strictEqual(calculateAngle(null, { x: 0, y: 0 }, { x: 1, y: 1 }), null);
  assert.strictEqual(calculateAngle({ x: 0, y: 0 }, null, { x: 1, y: 1 }), null);
});

runTest('1.4 Handle identical overlapping points without NaN', () => {
  const p1 = { x: 0.5, y: 0.5 };
  const p2 = { x: 0.5, y: 0.5 };
  const p3 = { x: 0.5, y: 0.5 };
  assert.strictEqual(calculateAngle(p1, p2, p3), null);
});

// 2. Landmark Visibility Filtering
runTest('2.1 High confidence landmarks return visible true', () => {
  const landmarks = [];
  landmarks[23] = { x: 0.5, y: 0.5, visibility: 0.9 };
  landmarks[25] = { x: 0.5, y: 0.7, visibility: 0.85 };
  landmarks[27] = { x: 0.5, y: 0.9, visibility: 0.95 };
  assert.strictEqual(areLandmarksVisible(landmarks, [23, 25, 27], 0.45), true);
});

runTest('2.2 Low confidence landmarks return visible false', () => {
  const landmarks = [];
  landmarks[23] = { x: 0.5, y: 0.5, visibility: 0.9 };
  landmarks[25] = { x: 0.5, y: 0.7, visibility: 0.20 }; // Below 0.45
  landmarks[27] = { x: 0.5, y: 0.9, visibility: 0.95 };
  assert.strictEqual(areLandmarksVisible(landmarks, [23, 25, 27], 0.45), false);
});

// 3. Movement Engine State Machine & Rep Detection
runTest('3.1 Full Squat Repetition Sequence (Standing -> Squatting -> Standing)', () => {
  const engine = new MovementEngine(SQUAT_CONFIG);

  // Helper to construct mock landmarks with a target knee angle
  const createSquatLandmarks = (kneeAngleDeg) => {
    const landmarks = [];
    // Approximate leg points for desired knee angle
    const rad = (kneeAngleDeg * Math.PI) / 180;
    const hip = { x: 0.5, y: 0.2, visibility: 0.9 };
    const knee = { x: 0.5, y: 0.5, visibility: 0.9 };
    const ankle = {
      x: 0.5 + 0.3 * Math.sin(Math.PI - rad),
      y: 0.5 + 0.3 * Math.cos(Math.PI - rad),
      visibility: 0.9,
    };

    // Set for both legs
    landmarks[23] = hip; landmarks[25] = knee; landmarks[27] = ankle;
    landmarks[24] = hip; landmarks[26] = knee; landmarks[28] = ankle;
    return landmarks;
  };

  // Step 1: Initial positioning (Standing straight ~175 deg)
  let res = engine.processFrame(createSquatLandmarks(175));
  assert.strictEqual(res.phase, 'READY');
  assert.strictEqual(res.repsCompleted, 0);

  // Step 2: Descending into squat (~140 deg)
  res = engine.processFrame(createSquatLandmarks(140));
  assert.strictEqual(res.phase, 'IN_MOTION');

  // Step 3: Peak squat depth reached (~105 deg <= peakThreshold 115)
  res = engine.processFrame(createSquatLandmarks(105));
  assert.strictEqual(res.phase, 'PEAK');

  // Step 4: Ascending back up (~135 deg > 125)
  res = engine.processFrame(createSquatLandmarks(135));
  assert.strictEqual(res.phase, 'RETURNING');

  // Step 5: Returned to full standing position (~175 deg >= returnThreshold 155)
  // Simulate time passage past debounce threshold
  engine.lastRepTimestamp = Date.now() - 2000;
  res = engine.processFrame(createSquatLandmarks(175));
  assert.strictEqual(res.phase, 'READY');
  assert.strictEqual(res.repsCompleted, 1);
  assert.strictEqual(res.repJustCompleted, true);
});

runTest('3.2 Reject Incomplete Squat (Half-rep without reaching peak depth)', () => {
  const engine = new MovementEngine(SQUAT_CONFIG);

  const createSquatLandmarks = (angle) => {
    const lms = [];
    const hip = { x: 0.5, y: 0.2, visibility: 0.9 };
    const knee = { x: 0.5, y: 0.5, visibility: 0.9 };
    const rad = (angle * Math.PI) / 180;
    const ankle = { x: 0.5 + 0.3 * Math.sin(Math.PI - rad), y: 0.5 + 0.3 * Math.cos(Math.PI - rad), visibility: 0.9 };
    lms[23] = hip; lms[25] = knee; lms[27] = ankle;
    lms[24] = hip; lms[26] = knee; lms[28] = ankle;
    return lms;
  };

  engine.processFrame(createSquatLandmarks(175)); // READY
  engine.processFrame(createSquatLandmarks(140)); // IN_MOTION
  engine.processFrame(createSquatLandmarks(130)); // IN_MOTION (Did NOT reach peak <= 115)
  const res = engine.processFrame(createSquatLandmarks(175)); // Stood back up

  assert.strictEqual(res.repsCompleted, 0); // No rep counted!
});

runTest('3.3 Tracking loss resets peak state and prevents false rep', () => {
  const engine = new MovementEngine(SQUAT_CONFIG);

  const validLms = [];
  validLms[23] = { x: 0.5, y: 0.2, visibility: 0.9 };
  validLms[25] = { x: 0.5, y: 0.5, visibility: 0.9 };
  validLms[27] = { x: 0.5, y: 0.5, visibility: 0.9 };
  validLms[24] = { x: 0.5, y: 0.2, visibility: 0.9 };
  validLms[26] = { x: 0.5, y: 0.5, visibility: 0.9 };
  validLms[28] = { x: 0.5, y: 0.5, visibility: 0.9 };

  engine.processFrame(validLms); // Positioned

  // Tracking drops out (empty landmarks)
  const resEmpty = engine.processFrame([]);
  assert.strictEqual(resEmpty.isVisible, false);
  assert.strictEqual(resEmpty.phase, 'POSITIONING');
  assert.strictEqual(engine.hasPeakReached, false);
});

console.log('====================================================');
console.log(`Camera Mode Engine Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
