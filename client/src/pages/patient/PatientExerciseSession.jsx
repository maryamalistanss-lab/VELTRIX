import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import CircularProgress from '../../components/common/CircularProgress';
import PainScaleSelector from '../../components/common/PainScaleSelector';
import CameraSessionView from '../../components/camera/CameraSessionView';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';

/**
 * PatientExerciseSession Component — VELTRIX Phase 11
 * Supports both Guided Mode (Clinical Pacing) and Camera Mode (Beta Computer Vision).
 */
export default function PatientExerciseSession() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: 'guided' | 'camera' (default to location state if launched directly via Camera Mode)
  const [exerciseMode, setExerciseMode] = useState(() => location.state?.mode || 'guided');

  // Exercise Data State
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guided Mode Session Flow State: 'PRE_CHECK' | 'ACTIVE' | 'REST'
  const [phase, setPhase] = useState('PRE_CHECK');
  const [painBefore, setPainBefore] = useState(2);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cadenceSeconds, setCadenceSeconds] = useState(4);
  const [restSeconds, setRestSeconds] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Pointers for cleanup
  const elapsedTimerRef = useRef(null);
  const cadenceTimerRef = useRef(null);
  const restTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialSessionExercise() {
      try {
        const response = await api.get(`/exercises/${exerciseId}`);
        if (isMounted) {
          if (response.data && response.data.success && response.data.data) {
            setExercise(response.data.data);
          } else {
            setError('Exercise not found.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load exercise session:', err);
          setError(err.response?.data?.message || 'Unable to load exercise details.');
          setIsLoading(false);
        }
      }
    }

    if (exerciseId) {
      loadInitialSessionExercise();
    }
    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  const totalSets = exercise?.defaultSets || 3;
  const targetReps = exercise?.defaultReps || 10;

  // Total Workout Elapsed Timer for Guided Mode
  useEffect(() => {
    if (exerciseMode !== 'guided' || phase === 'PRE_CHECK' || isPaused) {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      return;
    }

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [exerciseMode, phase, isPaused]);

  // Movement Cadence Timer during ACTIVE Guided phase
  useEffect(() => {
    if (exerciseMode !== 'guided' || phase !== 'ACTIVE' || isPaused) {
      if (cadenceTimerRef.current) clearInterval(cadenceTimerRef.current);
      return;
    }

    cadenceTimerRef.current = setInterval(() => {
      setCadenceSeconds((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => {
      if (cadenceTimerRef.current) clearInterval(cadenceTimerRef.current);
    };
  }, [exerciseMode, phase, isPaused]);

  // Rest Interval Countdown Timer
  useEffect(() => {
    if (exerciseMode !== 'guided' || phase !== 'REST' || isPaused) {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      return;
    }

    restTimerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(restTimerRef.current);
          setCurrentSet((s) => s + 1);
          setCurrentRep(0);
          setCadenceSeconds(4);
          setPhase('ACTIVE');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [exerciseMode, phase, isPaused]);

  // Finish session helper: navigates to post-exercise feedback with state
  const handleProceedToFeedback = useCallback(
    (completedSetsCount, completedRepsCount, cameraDuration) => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (cadenceTimerRef.current) clearInterval(cadenceTimerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);

      const duration = cameraDuration || elapsedSeconds || 180;

      navigate(`/patient/exercises/${exercise?.id || exercise?._id || exerciseId}/feedback`, {
        state: {
          exerciseId: exercise?.id || exercise?._id || exerciseId,
          exerciseName: exercise?.name || exercise?.title || 'Rehabilitation Exercise',
          targetBodyPart: exercise?.targetBodyPart || exercise?.bodyPart,
          setsCompleted: Math.max(1, completedSetsCount),
          repsCompleted: Math.max(1, completedRepsCount),
          durationSeconds: Math.max(1, duration),
          painBefore: Number(painBefore),
        },
      });
    },
    [exercise, exerciseId, elapsedSeconds, painBefore, navigate]
  );

  // Camera Mode completion handoff
  const handleCameraFinish = useCallback(
    (cameraResults) => {
      handleProceedToFeedback(
        cameraResults.setsCompleted,
        cameraResults.repsCompleted,
        cameraResults.durationSeconds
      );
    },
    [handleProceedToFeedback]
  );

  // Handle +1 Rep in Guided Mode
  const handleNextRep = () => {
    if (phase !== 'ACTIVE') return;

    const nextRep = currentRep + 1;
    if (nextRep < targetReps) {
      setCurrentRep(nextRep);
      setCadenceSeconds(4);
    } else {
      setCurrentRep(targetReps);
      if (currentSet < totalSets) {
        setPhase('REST');
        setRestSeconds(30);
      } else {
        handleProceedToFeedback(currentSet, targetReps);
      }
    }
  };

  // Skip rest period in Guided Mode
  const handleSkipRest = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setCurrentSet((s) => s + 1);
    setCurrentRep(0);
    setCadenceSeconds(4);
    setPhase('ACTIVE');
  };

  // Format mm:ss
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ maxWidth: 760, textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Preparing exercise session...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="page-container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 20 }}>
          <Link to={ROUTES.PATIENT.EXERCISES} className="btn btn-ghost btn-sm">
            &larr; Exit Session
          </Link>
        </div>
        <Card style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--color-danger, #EF4444)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Session Unavailable</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error || 'Unable to start exercise.'}</p>
          <Link to={ROUTES.PATIENT.EXERCISES} className="btn btn-primary">
            Back to Exercises
          </Link>
        </Card>
      </div>
    );
  }

  const exerciseTitle = exercise.name || exercise.title;
  const instructions = Array.isArray(exercise.instructions) ? exercise.instructions : [];

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      {/* Session Header & Mode Selection Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Link to={`/patient/exercises/${exercise.id || exercise._id}`} className="btn btn-ghost btn-sm">
          &larr; Exit Session
        </Link>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'inline-flex',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setExerciseMode('guided')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: exerciseMode === 'guided' ? 'var(--color-surface)' : 'transparent',
              color: exerciseMode === 'guided' ? 'var(--primary-indigo)' : 'var(--text-secondary)',
              boxShadow: exerciseMode === 'guided' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            🧭 Guided Pacing
          </button>
          <button
            type="button"
            onClick={() => setExerciseMode('camera')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: exerciseMode === 'camera' ? 'var(--color-surface)' : 'transparent',
              color: exerciseMode === 'camera' ? 'var(--primary-indigo)' : 'var(--text-secondary)',
              boxShadow: exerciseMode === 'camera' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            📷 Camera Mode (Beta)
          </button>
        </div>
      </div>

      {/* CAMERA MODE BETA VIEW */}
      {exerciseMode === 'camera' ? (
        <CameraSessionView
          exercise={exercise}
          onFinish={handleCameraFinish}
          onExitGuided={() => setExerciseMode('guided')}
        />
      ) : (
        /* GUIDED PACING MODE VIEW */
        <>
          {/* PHASE 1: PRE-EXERCISE PAIN CHECK */}
          {phase === 'PRE_CHECK' && (
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 44, display: 'block', marginBottom: 8 }}>🩺</span>
                <h1 className="page-title" style={{ fontSize: 24, marginBottom: 6 }}>
                  Pre-Exercise Safety Check
                </h1>
                <p className="page-subtitle">
                  Before beginning <strong>{exerciseTitle}</strong>, how is your pain right now?
                </p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label
                  className="form-label"
                  style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontSize: 15 }}
                >
                  Current baseline pain level (0 to 10):
                </label>
                <PainScaleSelector value={painBefore} onChange={setPainBefore} />
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Routine:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {totalSets} Sets &bull; {targetReps} Reps per set
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPhase('ACTIVE')}
                className="btn btn-primary btn-block btn-lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span>Begin Guided Workout &rarr;</span>
              </button>
            </Card>
          )}

          {/* PHASE 2: ACTIVE EXERCISE STAGE */}
          {phase === 'ACTIVE' && (
            <Card>
              {/* Telemetry Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: 14,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Set {currentSet} of {totalSets}
                  </span>
                  <Badge variant="mint">In Progress</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    ⏱️ {formatTime(elapsedSeconds)}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    Rep {currentRep} / {targetReps}
                  </span>
                </div>
              </div>

              {/* Visual Presentation Area */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 0',
                  textAlign: 'center',
                }}
              >
                {/* Visual Icon Box */}
                <div
                  style={{
                    width: 180,
                    height: 140,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 60,
                    marginBottom: 18,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  🧘‍♂️🦵
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {exerciseTitle}
                </h3>

                {/* Instruction Guidance */}
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    maxWidth: 480,
                    lineHeight: 1.5,
                    margin: '0 0 20px 0',
                    minHeight: 42,
                  }}
                >
                  {instructions.length > 0
                    ? instructions[Math.min(currentRep % instructions.length, instructions.length - 1)]
                    : 'Maintain controlled movement. Focus on slow, steady muscle engagement.'}
                </p>

                {/* Cadence Visual Circular Gauge */}
                <div style={{ marginBottom: 20 }}>
                  <CircularProgress
                    value={Math.round((cadenceSeconds / 4) * 100)}
                    size={88}
                    strokeWidth={7}
                    color="var(--primary-indigo)"
                    label={cadenceSeconds}
                    sublabel="sec cadence"
                  />
                </div>

                {/* Rep Counter Display */}
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Rep {currentRep} / {targetReps}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Tap &quot;+1 Rep&quot; upon completing each repetition
                </p>
              </div>

              {/* Action Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: 20,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="btn btn-outline"
                  style={{ minWidth: 110 }}
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>

                <button
                  type="button"
                  onClick={handleNextRep}
                  disabled={isPaused}
                  className="btn btn-secondary"
                  style={{ minWidth: 160 }}
                >
                  +1 Rep ({currentRep}/{targetReps})
                </button>

                <button
                  type="button"
                  onClick={() => handleProceedToFeedback(currentSet, Math.max(currentRep, 1))}
                  className="btn btn-primary"
                  style={{ minWidth: 140 }}
                >
                  Finish &rarr;
                </button>
              </div>
            </Card>
          )}

          {/* PHASE 3: REST INTERVAL BETWEEN SETS */}
          {phase === 'REST' && (
            <Card style={{ textAlign: 'center', padding: '36px 20px' }}>
              <Badge variant="info" style={{ marginBottom: 16 }}>
                Set {currentSet} Completed!
              </Badge>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Rest Interval
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                Take deep breaths and relax your muscles before starting Set {currentSet + 1} of {totalSets}.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <CircularProgress
                  value={Math.round((restSeconds / 30) * 100)}
                  size={120}
                  strokeWidth={9}
                  color="var(--accent-mint)"
                  label={restSeconds}
                  sublabel="sec rest"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="btn btn-outline"
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>

                <button type="button" onClick={handleSkipRest} className="btn btn-primary">
                  Skip Rest & Start Set {currentSet + 1} &rarr;
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
