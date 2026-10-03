import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import Card from '../Card';
import Badge from '../common/Badge';
import { getExerciseCameraConfig } from '../../utils/camera/poseDetectorConfig';
import { MovementEngine } from '../../utils/camera/movementEngine';

/**
 * CameraSessionView Component — VELTRIX Phase 11 Camera Mode Beta
 * Features browser-side MediaPipe Pose Landmarker, live posture feedback, camera stream lifecycle management, and privacy-safe rep tracking.
 */
export default function CameraSessionView({ exercise, onFinish, onExitGuided }) {
  // Exercise Camera Configuration & Strategy
  const cameraConfig = getExerciseCameraConfig(exercise);

  // Component UI States
  const [cameraState, setCameraState] = useState('initializing'); // 'initializing' | 'granted' | 'denied' | 'no_device' | 'unavailable'
  const [modelState, setModelState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  // Exercise Session Progress States
  const [currentSet, setCurrentSet] = useState(1);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState('Position yourself in full view of the camera...');
  const [currentAngleDisplay, setCurrentAngleDisplay] = useState(null);
  const [isLandmarkVisible, setIsLandmarkVisible] = useState(false);
  const [movementPhase, setMovementPhase] = useState('POSITIONING');

  // DOM & Pipeline References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const movementEngineRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const totalSets = exercise?.defaultSets || 3;
  const targetReps = exercise?.defaultReps || 10;

  // Cleanup helper: stops all active camera tracks immediately
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping camera track:', e);
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup helper: cancels animation frames and releases landmarker
  const stopPosePipeline = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      try {
        poseLandmarkerRef.current.close();
      } catch (e) {
        console.warn('Error closing pose landmarker:', e);
      }
      poseLandmarkerRef.current = null;
    }
  }, []);

  // Total Elapsed Timer
  useEffect(() => {
    if (cameraState !== 'granted' || isPaused) {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      return;
    }

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [cameraState, isPaused]);

  // Handle completion & handoff to post-exercise feedback
  const handleCompleteSession = useCallback(
    (finalSets, finalReps) => {
      stopCameraStream();
      stopPosePipeline();

      if (onFinish) {
        onFinish({
          setsCompleted: Math.max(1, finalSets || currentSet),
          repsCompleted: Math.max(1, finalReps || repsCompleted),
          durationSeconds: Math.max(1, elapsedSeconds),
        });
      }
    },
    [stopCameraStream, stopPosePipeline, onFinish, currentSet, repsCompleted, elapsedSeconds]
  );

  // Initialize MediaPipe Pose Landmarker Model
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      if (!cameraConfig.isSupported) return;

      try {
        setModelState('loading');
        // Resolve WASM assets from CDN
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        if (!isMounted) return;

        // Initialize PoseLandmarker
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (!isMounted) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;
        movementEngineRef.current = new MovementEngine(cameraConfig);
        setModelState('ready');
      } catch (err) {
        console.error('Failed to initialize MediaPipe Pose Landmarker:', err);
        if (isMounted) {
          setModelState('error');
          setErrorMessage('Unable to load computer vision pose model. Please check internet connection.');
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
    };
  }, [cameraConfig]);

  // Request & Start Camera Stream
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      if (!cameraConfig.isSupported) return;

      try {
        setCameraState('initializing');
        setErrorMessage(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) {
            setCameraState('unavailable');
            setErrorMessage('Camera API is not supported in this browser environment.');
          }
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) {
              videoRef.current.play().catch((e) => console.warn('Video play error:', e));
              setCameraState('granted');
            }
          };
        }
      } catch (err) {
        console.error('Camera permission/access error:', err);
        if (isMounted) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraState('denied');
            setErrorMessage('Camera access denied. Please grant camera permissions in your browser settings.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraState('no_device');
            setErrorMessage('No camera device was found on your device.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setCameraState('unavailable');
            setErrorMessage('Camera is already in use by another application.');
          } else {
            setCameraState('unavailable');
            setErrorMessage(err.message || 'Unable to access camera.');
          }
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCameraStream();
    };
  }, [cameraConfig, stopCameraStream]);

  // Frame Processing Loop using requestAnimationFrame
  useEffect(() => {
    if (cameraState !== 'granted' || modelState !== 'ready' || isPaused) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    const renderLoop = () => {
      if (!video || video.paused || video.ended || !poseLandmarkerRef.current || !movementEngineRef.current) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Match canvas dimensions to video dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      const startTimeMs = performance.now();

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

          // Clear previous canvas drawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results && results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];

            // 1. Process movement logic state
            const stateResult = movementEngineRef.current.processFrame(landmarks);

            // 2. Draw Posture Skeleton on Overlay Canvas
            drawPoseOverlay(ctx, landmarks, canvas.width, canvas.height, cameraConfig.requiredLandmarks);

            // 3. Batch UI state updates to prevent excessive renders
            if (stateResult.repsCompleted !== repsCompleted) {
              setRepsCompleted(stateResult.repsCompleted);

              // Check if set is complete
              if (stateResult.repsCompleted >= targetReps) {
                if (currentSet < totalSets) {
                  setCurrentSet((s) => s + 1);
                  movementEngineRef.current.reset();
                  setRepsCompleted(0);
                } else {
                  // Finish all sets!
                  handleCompleteSession(currentSet, targetReps);
                  return;
                }
              }
            }

            setCurrentFeedback(stateResult.feedback);
            setCurrentAngleDisplay(stateResult.currentAngle);
            setIsLandmarkVisible(stateResult.isVisible);
            setMovementPhase(stateResult.phase);
          } else {
            setCurrentFeedback('No person detected in camera view.');
            setIsLandmarkVisible(false);
          }
        } catch (err) {
          console.warn('Frame detection error:', err);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [
    cameraState,
    modelState,
    isPaused,
    cameraConfig,
    repsCompleted,
    targetReps,
    currentSet,
    totalSets,
    handleCompleteSession,
  ]);

  // Clean Pose Overlay Canvas Drawer
  const drawPoseOverlay = (ctx, landmarks, width, height, highlightIndices) => {
    // Skeletal Connections definition
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
      [11, 23], [12, 24], [23, 24],                    // Torso / Hips
      [23, 25], [25, 27], [24, 26], [26, 28]           // Legs
    ];

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10B981'; // Mint Green connection lines

    // Draw Skeleton Lines
    for (const [i, j] of connections) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    // Draw Joint Keypoints
    const highlightSet = new Set(highlightIndices || []);
    landmarks.forEach((lm, idx) => {
      if ((lm.visibility ?? 1) > 0.4) {
        const x = lm.x * width;
        const y = lm.y * height;
        const isTargetJoint = highlightSet.has(idx);

        ctx.beginPath();
        ctx.arc(x, y, isTargetJoint ? 7 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isTargetJoint ? '#4F46E5' : '#10B981'; // Primary Indigo for target joints
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    });

    ctx.restore();
  };

  // Format mm:ss
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // UNSUPPORTED EXERCISE FALLBACK VIEW
  if (!cameraConfig.isSupported) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📷⚡</div>
        <h2 style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>
          Camera Mode Beta Unavailable
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Camera Mode Beta is currently optimized for selected 2D movements: <strong>Squat</strong>,{' '}
          <strong>Arm Raise</strong>, <strong>Seated Knee Extension</strong>, and <strong>Wall Push Up</strong>.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
          Please use Guided Mode to complete <strong>{exercise?.name || exercise?.title || 'this exercise'}</strong> with clinical pacing.
        </p>
        <button type="button" onClick={onExitGuided} className="btn btn-primary btn-lg">
          Switch to Guided Mode &rarr;
        </button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner: Privacy & Mode Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Badge variant="mint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span>📷</span> Camera Mode (Beta)
        </Badge>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          🔒 Browser-Side Processing &bull; No Video Recorded
        </span>
      </div>

      {/* ERROR STATES DISPLAY */}
      {cameraState === 'denied' && (
        <Card style={{ borderColor: 'var(--color-danger, #EF4444)', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🚫</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Camera Access Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{errorMessage}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button type="button" onClick={onExitGuided} className="btn btn-primary">
              Use Guided Mode Instead
            </button>
          </div>
        </Card>
      )}

      {(cameraState === 'no_device' || cameraState === 'unavailable' || modelState === 'error') && (
        <Card style={{ borderColor: 'var(--color-warning, #F59E0B)', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Camera Unavailable</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            {errorMessage || 'Unable to start camera or pose landmarker model.'}
          </p>
          <button type="button" onClick={onExitGuided} className="btn btn-primary">
            Continue with Guided Mode
          </button>
        </Card>
      )}

      {/* ACTIVE CAMERA VIEW CONTAINER */}
      {(cameraState === 'granted' || cameraState === 'initializing') && modelState !== 'error' && (
        <Card style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          {/* Telemetry Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                Set {currentSet} / {totalSets}
              </span>
              <Badge variant={isLandmarkVisible ? 'mint' : 'warning'}>
                {isLandmarkVisible ? 'Targeting Posture' : 'Searching Body'}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                ⏱️ {formatTime(elapsedSeconds)}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-indigo)' }}>
                Reps: {repsCompleted} / {targetReps}
              </span>
            </div>
          </div>

          {/* Main Video Preview with Canvas Overlay */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              maxHeight: 460,
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Loading Spinner during initialization */}
            {(cameraState === 'initializing' || modelState === 'loading') && (
              <div style={{ textAlign: 'center', color: '#FFFFFF', padding: 20 }}>
                <div className="spinner" style={{ margin: '0 auto 12px', borderColor: '#FFFFFF', borderTopColor: '#4F46E5' }}></div>
                <p style={{ fontSize: 14, margin: 0 }}>Initializing Pose Landmarker & Camera...</p>
              </div>
            )}

            {/* Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scaleX(-1)', // Mirror feed for natural patient experience
              }}
            />

            {/* Canvas Skeleton Overlay */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scaleX(-1)', // Match mirrored video
                pointerEvents: 'none',
              }}
            />

            {/* Floating Live Joint Angle Indicator */}
            {currentAngleDisplay !== null && isLandmarkVisible && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                Joint Angle: {currentAngleDisplay}°
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                ⏸ Session Paused
              </div>
            )}
          </div>

          {/* Real-time Guidance Feedback Banner */}
          <div
            style={{
              padding: '16px 20px',
              background: isLandmarkVisible
                ? 'var(--color-surface-elevated)'
                : 'rgba(245, 158, 11, 0.12)',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              minHeight: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentFeedback}
            </p>
          </div>

          {/* Action Controls Bar */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'var(--color-surface)',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onExitGuided}
              className="btn btn-ghost btn-sm"
            >
              &larr; Switch to Guided Mode
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="btn btn-outline"
                disabled={cameraState !== 'granted'}
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>

              <button
                type="button"
                onClick={() => handleCompleteSession(currentSet, Math.max(repsCompleted, 1))}
                className="btn btn-primary"
              >
                Finish Workout &rarr;
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
