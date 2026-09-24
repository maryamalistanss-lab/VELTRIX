import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import CircularProgress from '../../components/common/CircularProgress';
import { exerciseCatalog } from '../../data/exerciseMockData';

/**
 * PatientExerciseSession Component
 * Replicates Screen 4 of Patient App in Image 1 & 2 (Guided + Camera Mode toggle).
 */
export default function PatientExerciseSession() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState(() => (searchParams.get('mode') === 'camera' ? 'camera' : 'guided'));
  const [currentSet] = useState(1);
  const [totalSets] = useState(3);
  const [currentRep, setCurrentRep] = useState(6);
  const [totalReps] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(12);

  const exercise =
    exerciseCatalog.find((ex) => ex.id === exerciseId) ||
    exerciseCatalog.find((ex) => ex.id === 'ex-knee-extension') ||
    exerciseCatalog[0];

  // Visual cadence timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 1 ? prev - 1 : 12));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNextRep = () => {
    if (currentRep < totalReps) {
      setCurrentRep((r) => r + 1);
    } else {
      // Completed reps, proceed to Pain & Difficulty feedback screen (Screen 5)
      navigate(`/patient/exercises/${exercise.id}/feedback`);
    }
  };

  const handleCompleteSession = () => {
    navigate(`/patient/exercises/${exercise.id}/feedback`);
  };

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      {/* Top Session Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Link
          to={`/patient/exercises/${exercise.id}`}
          className="btn btn-ghost btn-sm"
        >
          &larr; Exit Session
        </Link>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--color-surface-elevated)',
            padding: 4,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('guided')}
            className={`btn btn-sm ${mode === 'guided' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 14px' }}
          >
            Guided Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`btn btn-sm ${mode === 'camera' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 14px' }}
          >
            Camera Mode (Beta)
          </button>
        </div>
      </div>

      {/* Main Interactive Session Stage Card */}
      <Card>
        {/* Session Progress Header */}
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
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Set {currentSet}/{totalSets}
            </span>
            <Badge variant="mint">Live Protocol</Badge>
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-indigo)' }}>
            Rep {currentRep} / {totalReps}
          </div>
        </div>

        {/* Visual Presentation Area */}
        {mode === 'guided' ? (
          /* Guided Mode Display */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            {/* Center Pose Guidance Graphic */}
            <div
              style={{
                width: 220,
                height: 180,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 68,
                marginBottom: 20,
                border: '1px solid var(--border-color)',
              }}
            >
              🦵🪑
            </div>

            {/* Live Movement Instruction */}
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              Extend your leg slowly.
            </h3>

            {/* Circular Countdown Gauge */}
            <div style={{ marginBottom: 24 }}>
              <CircularProgress
                value={Math.round((timerSeconds / 12) * 100)}
                size={96}
                strokeWidth={8}
                color="#06B6D4"
                label={timerSeconds}
                sublabel="sec"
              />
            </div>
          </div>
        ) : (
          /* Camera Mode Display (Beta) */
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
            {/* Camera Viewport Simulation with Landmark Overlays */}
            <div
              style={{
                width: '100%',
                maxWidth: 440,
                height: 240,
                borderRadius: 'var(--radius-lg)',
                background: '#0D111D',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                marginBottom: 20,
              }}
            >
              {/* Simulated Skeleton Tracking Lines */}
              <svg width="240" height="200" viewBox="0 0 240 200" style={{ position: 'absolute' }}>
                <circle cx="120" cy="50" r="10" fill="#10B981" />
                <line x1="120" y1="60" x2="120" y2="120" stroke="#10B981" strokeWidth="3" />
                <line x1="120" y1="120" x2="160" y2="150" stroke="#10B981" strokeWidth="3" />
                <line x1="160" y1="150" x2="200" y2="140" stroke="#06B6D4" strokeWidth="4" />
                <circle cx="160" cy="150" r="6" fill="#06B6D4" />
                <circle cx="200" cy="140" r="6" fill="#10B981" />
              </svg>

              {/* Status Badge Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(16, 185, 129, 0.9)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>✓</span>
                <span>Good Movement</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: 12,
                }}
              >
                Simulated AI Landmark Feed
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Rep {currentRep} / {totalReps}
            </div>

            <p style={{ margin: '0 0 20px 0', fontSize: 14, color: 'var(--accent-mint)', fontWeight: 600 }}>
              Great job! Keep going.
            </p>
          </div>
        )}

        {/* Action Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            borderTop: '1px solid var(--border-color)',
            paddingTop: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-outline"
            style={{ minWidth: 120 }}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            type="button"
            onClick={handleNextRep}
            className="btn btn-secondary"
            style={{ minWidth: 140 }}
          >
            +1 Rep ({currentRep}/{totalReps})
          </button>

          <button
            type="button"
            onClick={handleCompleteSession}
            className="btn btn-primary"
            style={{ minWidth: 140 }}
          >
            Finish Exercise &rarr;
          </button>
        </div>
      </Card>
    </div>
  );
}
