import { areLandmarksVisible } from './angleCalculators';

/**
 * Movement & Repetition Analysis Engine for VELTRIX Camera Mode Beta
 * Implements finite-state machine with hysteresis and visibility checking to detect exercise repetitions cleanly.
 */

export const MOVEMENT_PHASES = {
  POSITIONING: 'POSITIONING',
  READY: 'READY',
  IN_MOTION: 'IN_MOTION',
  PEAK: 'PEAK',
  RETURNING: 'RETURNING',
};

export class MovementEngine {
  constructor(config) {
    this.config = config;
    this.phase = MOVEMENT_PHASES.POSITIONING;
    this.repsCompleted = 0;
    this.currentAngle = null;
    this.hasPeakReached = false;
    this.lastRepTimestamp = 0;
    this.minRepIntervalMs = 1200; // Debounce minimum 1.2s between repetitions
    this.feedback = 'Position yourself in front of the camera...';
    this.isVisible = false;
  }

  reset() {
    this.phase = MOVEMENT_PHASES.POSITIONING;
    this.repsCompleted = 0;
    this.currentAngle = null;
    this.hasPeakReached = false;
    this.lastRepTimestamp = 0;
    this.feedback = 'Position yourself in front of the camera...';
    this.isVisible = false;
  }

  /**
   * Evaluates a frame of MediaPipe landmarks against the exercise configuration.
   * @param {Array} landmarks - 33 Pose landmarks
   * @returns {Object} { phase, repsCompleted, currentAngle, feedback, isVisible, repJustCompleted }
   */
  processFrame(landmarks) {
    let repJustCompleted = false;

    if (!this.config || !this.config.isSupported) {
      return {
        phase: MOVEMENT_PHASES.POSITIONING,
        repsCompleted: this.repsCompleted,
        currentAngle: null,
        feedback: 'Camera Mode Beta is not available for this exercise.',
        isVisible: false,
        repJustCompleted: false,
      };
    }

    // 1. Verify visibility of required landmarks
    const visible = areLandmarksVisible(landmarks, this.config.requiredLandmarks, 0.45);
    this.isVisible = visible;

    if (!visible) {
      this.phase = MOVEMENT_PHASES.POSITIONING;
      this.hasPeakReached = false; // Safeguard: reset peak flag on tracking loss
      this.feedback = this.config.repositionMessage || 'Landmarks unclear. Step back into full view.';
      return {
        phase: this.phase,
        repsCompleted: this.repsCompleted,
        currentAngle: this.currentAngle,
        feedback: this.feedback,
        isVisible: false,
        repJustCompleted: false,
      };
    }

    // 2. Calculate primary joint angle
    const angle = this.config.getPrimaryAngle(landmarks);
    this.currentAngle = angle;

    if (angle === null || isNaN(angle)) {
      this.feedback = 'Unable to calculate joint angle. Please adjust your stance.';
      return {
        phase: this.phase,
        repsCompleted: this.repsCompleted,
        currentAngle: null,
        feedback: this.feedback,
        isVisible: true,
        repJustCompleted: false,
      };
    }

    const { startThreshold, peakThreshold, returnThreshold, guidance } = this.config;
    const now = Date.now();

    // Determine direction mode:
    // High-to-low (e.g. Squat, Wall Push Up: start > 140, peak < 115)
    // Low-to-high (e.g. Arm Raise, Knee Extension: start < 40, peak > 75)
    const isHighToLow = startThreshold > peakThreshold;

    if (isHighToLow) {
      // --- SQUAT / PUSH UP LOGIC ---
      if (this.phase === MOVEMENT_PHASES.POSITIONING) {
        if (angle >= startThreshold - 10) {
          this.phase = MOVEMENT_PHASES.READY;
          this.feedback = guidance.start || 'Good starting position! Begin when ready.';
        } else {
          this.feedback = 'Stand up fully to enter the starting position.';
        }
      } else if (this.phase === MOVEMENT_PHASES.READY) {
        this.feedback = guidance.start || 'Ready! Begin movement.';
        if (angle < startThreshold - 8) {
          this.phase = MOVEMENT_PHASES.IN_MOTION;
          this.feedback = guidance.moving || 'Movement detected...';
        }
      } else if (this.phase === MOVEMENT_PHASES.IN_MOTION) {
        this.feedback = guidance.moving || 'Continue smooth movement...';
        if (angle <= peakThreshold) {
          this.phase = MOVEMENT_PHASES.PEAK;
          this.hasPeakReached = true;
          this.feedback = guidance.peak || 'Good depth! Hold briefly, then return.';
        }
      } else if (this.phase === MOVEMENT_PHASES.PEAK) {
        this.feedback = guidance.peak || 'Push back up smoothly...';
        if (angle > peakThreshold + 10) {
          this.phase = MOVEMENT_PHASES.RETURNING;
          this.feedback = guidance.returning || 'Returning to start position...';
        }
      } else if (this.phase === MOVEMENT_PHASES.RETURNING) {
        this.feedback = guidance.returning || 'Returning...';
        if (angle >= returnThreshold) {
          // Debounce check & peak verification
          if (now - this.lastRepTimestamp > this.minRepIntervalMs && this.hasPeakReached) {
            this.repsCompleted += 1;
            this.lastRepTimestamp = now;
            repJustCompleted = true;
            this.feedback = `Repetition ${this.repsCompleted} complete! Great form!`;
          }
          this.phase = MOVEMENT_PHASES.READY;
          this.hasPeakReached = false;
        }
      }
    } else {
      // --- ARM RAISE / KNEE EXTENSION LOGIC ---
      if (this.phase === MOVEMENT_PHASES.POSITIONING) {
        if (angle <= startThreshold + 10) {
          this.phase = MOVEMENT_PHASES.READY;
          this.feedback = guidance.start || 'Good starting position! Begin when ready.';
        } else {
          this.feedback = 'Lower limbs/arms to relaxed starting position.';
        }
      } else if (this.phase === MOVEMENT_PHASES.READY) {
        this.feedback = guidance.start || 'Ready! Begin movement.';
        if (angle > startThreshold + 8) {
          this.phase = MOVEMENT_PHASES.IN_MOTION;
          this.feedback = guidance.moving || 'Movement detected...';
        }
      } else if (this.phase === MOVEMENT_PHASES.PEAK) {
        this.feedback = guidance.peak || 'Hold briefly, then lower with control...';
        if (angle < peakThreshold - 10) {
          this.phase = MOVEMENT_PHASES.RETURNING;
          this.feedback = guidance.returning || 'Lowering back to start position...';
        }
      } else if (this.phase === MOVEMENT_PHASES.IN_MOTION) {
        this.feedback = guidance.moving || 'Elevating...';
        if (angle >= peakThreshold) {
          this.phase = MOVEMENT_PHASES.PEAK;
          this.hasPeakReached = true;
          this.feedback = guidance.peak || 'Peak extension reached!';
        }
      } else if (this.phase === MOVEMENT_PHASES.RETURNING) {
        this.feedback = guidance.returning || 'Lowering...';
        if (angle <= returnThreshold) {
          // Debounce check & peak verification
          if (now - this.lastRepTimestamp > this.minRepIntervalMs && this.hasPeakReached) {
            this.repsCompleted += 1;
            this.lastRepTimestamp = now;
            repJustCompleted = true;
            this.feedback = `Repetition ${this.repsCompleted} complete! Excellent!`;
          }
          this.phase = MOVEMENT_PHASES.READY;
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
