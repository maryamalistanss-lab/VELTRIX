/**
 * Angle & Pose Math Utility Functions for VELTRIX Camera Mode Beta
 * Operates on normalized 2D/3D MediaPipe pose landmarks.
 */

/**
 * Calculates 2D angle (in degrees 0-180) between three points (p1, p2, p3) where p2 is the vertex.
 * @param {Object} p1 - { x, y, visibility }
 * @param {Object} p2 - Vertex point { x, y, visibility }
 * @param {Object} p3 - { x, y, visibility }
 * @returns {number|null} Angle in degrees [0, 180], or null if invalid inputs
 */
export function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return null;
  if (typeof p1.x !== 'number' || typeof p2.x !== 'number' || typeof p3.x !== 'number') return null;
  if (typeof p1.y !== 'number' || typeof p2.y !== 'number' || typeof p3.y !== 'number') return null;

  // Handle edge case of overlapping points
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

/**
 * Checks if all required landmark indices exist and meet minimum visibility confidence.
 * @param {Array} landmarks - List of MediaPipe landmark objects
 * @param {Array<number>} indices - Required landmark indices
 * @param {number} minVisibility - Threshold (0.0 to 1.0, default 0.45)
 * @returns {boolean}
 */
export function areLandmarksVisible(landmarks, indices, minVisibility = 0.45) {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return false;
  if (!Array.isArray(indices) || indices.length === 0) return true;

  for (const idx of indices) {
    const lm = landmarks[idx];
    if (!lm) return false;
    // Note: visibility is optional in some MediaPipe models; treat undefined as visible
    if (typeof lm.visibility === 'number' && lm.visibility < minVisibility) {
      return false;
    }
  }

  return true;
}

/**
 * MediaPipe Pose Landmark Indices Reference (BlazePose 33 Keypoints)
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};
