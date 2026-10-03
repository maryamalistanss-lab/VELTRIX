import { calculateAngle, POSE_LANDMARKS } from './angleCalculators';

/**
 * Exercise Camera Strategy Configuration Registry for VELTRIX Phase 11
 * Maps exercise names/types to reliable 2D MediaPipe landmark configurations.
 */

export const EXERCISE_CAMERA_CONFIGS = {
  SQUAT: {
    key: 'squat',
    name: 'Squat',
    isSupported: true,
    requiredLandmarks: [
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ],
    getPrimaryAngle: (landmarks) => {
      // Calculate knee flexion angles (Hip - Knee - Ankle) for both legs and average them
      const leftKneeAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_KNEE],
        landmarks[POSE_LANDMARKS.LEFT_ANKLE]
      );
      const rightKneeAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_KNEE],
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
      );

      if (leftKneeAngle !== null && rightKneeAngle !== null) {
        return Math.round((leftKneeAngle + rightKneeAngle) / 2);
      }
      return leftKneeAngle !== null ? leftKneeAngle : rightKneeAngle;
    },
    // Standing: ~170-180deg; Squat peak: <= 115deg; Return: >= 155deg
    startThreshold: 155,
    peakThreshold: 115,
    returnThreshold: 155,
    guidance: {
      start: 'Stand tall with full body in frame facing or angled to camera.',
      moving: 'Hinge hips and bend knees downward smoothly...',
      peak: 'Good depth! Hold briefly, then push up through heels.',
      returning: 'Returning to starting position...',
    },
    repositionMessage: 'Step back so your hips, knees, and ankles are clearly visible.',
  },

  ARM_RAISE: {
    key: 'arm_raise',
    name: 'Arm Raise / Shoulder Abduction',
    isSupported: true,
    requiredLandmarks: [
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
    ],
    getPrimaryAngle: (landmarks) => {
      // Calculate shoulder elevation angle (Hip - Shoulder - Elbow)
      const leftShoulderAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW]
      );
      const rightShoulderAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW]
      );

      if (leftShoulderAngle !== null && rightShoulderAngle !== null) {
        return Math.round((leftShoulderAngle + rightShoulderAngle) / 2);
      }
      return leftShoulderAngle !== null ? leftShoulderAngle : rightShoulderAngle;
    },
    // Arms at side: <= 35deg; Raised: >= 75deg; Returned: <= 40deg
    startThreshold: 35,
    peakThreshold: 75,
    returnThreshold: 40,
    guidance: {
      start: 'Stand or sit with arms relaxed at your sides.',
      moving: 'Raise arms forward/upward toward shoulder height...',
      peak: 'Great elevation! Hold steadily, then lower with control.',
      returning: 'Lowering arms back to your sides...',
    },
    repositionMessage: 'Ensure your shoulders, torso, and arms are visible.',
  },

  SEATED_KNEE_EXTENSION: {
    key: 'knee_extension',
    name: 'Seated Knee Extension',
    isSupported: true,
    requiredLandmarks: [
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
    ],
    getPrimaryAngle: (landmarks) => {
      // Primary angle: Knee joint angle (Hip - Knee - Ankle)
      const leftAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_KNEE],
        landmarks[POSE_LANDMARKS.LEFT_ANKLE]
      );
      const rightAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_KNEE],
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
      );

      // Prefer leg with larger extension motion or available joint
      if (leftAngle !== null && rightAngle !== null) {
        return Math.max(leftAngle, rightAngle);
      }
      return leftAngle !== null ? leftAngle : rightAngle;
    },
    // Seated bent knee: <= 105deg; Extended horizontal leg: >= 155deg; Returned: <= 110deg
    startThreshold: 110,
    peakThreshold: 155,
    returnThreshold: 115,
    guidance: {
      start: 'Sit upright with knees bent at 90 degrees.',
      moving: 'Extend leg straight out horizontally...',
      peak: 'Peak extension! Hold quadriceps contracted briefly.',
      returning: 'Lower leg back down smoothly...',
    },
    repositionMessage: 'Position camera to view your legs in profile or seated front view.',
  },

  WALL_PUSH_UP: {
    key: 'wall_push_up',
    name: 'Wall Push Up',
    isSupported: true,
    requiredLandmarks: [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.RIGHT_WRIST,
    ],
    getPrimaryAngle: (landmarks) => {
      // Calculate elbow flexion angle (Shoulder - Elbow - Wrist)
      const leftElbow = calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW],
        landmarks[POSE_LANDMARKS.LEFT_WRIST]
      );
      const rightElbow = calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
        landmarks[POSE_LANDMARKS.RIGHT_WRIST]
      );

      if (leftElbow !== null && rightElbow !== null) {
        return Math.round((leftElbow + rightElbow) / 2);
      }
      return leftElbow !== null ? leftElbow : rightElbow;
    },
    // Extended arms: >= 150deg; Bent arms (near wall): <= 95deg; Returned: >= 145deg
    startThreshold: 145,
    peakThreshold: 95,
    returnThreshold: 145,
    guidance: {
      start: 'Stand arm-length facing wall with palms on wall and elbows straight.',
      moving: 'Bend elbows smoothly to bring chest toward wall...',
      peak: 'Chest near wall! Pause briefly, then push firmly back.',
      returning: 'Pushing back to starting position...',
    },
    repositionMessage: 'Make sure your shoulders, elbows, and wrists are visible.',
  },
};

/**
 * Resolves camera strategy configuration for a given exercise object or name string.
 * @param {Object|string} exercise
 * @returns {Object} Strategy configuration
 */
export function getExerciseCameraConfig(exercise) {
  if (!exercise) {
    return { isSupported: false, reason: 'No exercise selected.' };
  }

  const name = (typeof exercise === 'string' ? exercise : exercise.name || exercise.title || '').toLowerCase();

  if (name.includes('squat')) {
    return EXERCISE_CAMERA_CONFIGS.SQUAT;
  }
  if (name.includes('arm raise') || name.includes('abduction') || name.includes('shoulder raise')) {
    return EXERCISE_CAMERA_CONFIGS.ARM_RAISE;
  }
  if (name.includes('knee extension')) {
    return EXERCISE_CAMERA_CONFIGS.SEATED_KNEE_EXTENSION;
  }
  if (name.includes('push up') || name.includes('push-up')) {
    return EXERCISE_CAMERA_CONFIGS.WALL_PUSH_UP;
  }

  return {
    isSupported: false,
    name: typeof exercise === 'string' ? exercise : exercise.name || 'Exercise',
    repositionMessage: 'Camera Mode Beta is currently available for Squat, Arm Raise, Seated Knee Extension, and Wall Push Up.',
  };
}
