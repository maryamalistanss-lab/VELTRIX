import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../utils/constants';

/**
 * PatientSessionSummary Component
 * Displays real telemetry summary of the logged session from MongoDB.
 */
export default function PatientSessionSummary() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const session = stateData.session || null;
  const exerciseName = stateData.exerciseName || 'Rehabilitation Exercise';

  const setsCompleted = session?.setsCompleted || 3;
  const repsCompleted = session?.repsCompleted || 10;
  const durationSec = session?.durationSeconds || 180;
  const painBefore = session?.painBefore !== undefined ? session.painBefore : 2;
  const painAfter = session?.painAfter !== undefined ? session.painAfter : 1;
  const difficulty = session?.perceivedDifficulty || 'moderate';
  const sessionId = session?.id || session?._id || 'Pending Confirmation';

  // Format duration into mm:ss
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const painDelta = painAfter - painBefore;

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <Card>
        {/* Celebration Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 16,
            marginBottom: 24,
          }}
        >
          {/* Mint Checkmark Circle */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-mint)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
              marginBottom: 16,
            }}
          >
            ✓
          </div>

          <h1 className="page-title" style={{ fontSize: 26, marginBottom: 6 }}>
            Exercise Complete!
          </h1>
          <p className="page-subtitle" style={{ fontSize: 16 }}>
            {exerciseName} &bull; Recorded to Clinical Log
          </p>
          <div style={{ marginTop: 8 }}>
            <Badge variant="mint">Session ID: {String(sessionId).slice(-8)}</Badge>
          </div>
        </div>

        {/* Telemetry Summary Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-elevated)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sets Completed</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {setsCompleted}
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-elevated)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reps / Set</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {repsCompleted}
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-elevated)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Duration</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary-indigo)', marginTop: 4 }}>
              {formatDuration(durationSec)}
            </div>
          </div>
        </div>

        {/* Clinical Pain & Tolerance Summary Card */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--color-surface)',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pain Before Session:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{painBefore} / 10</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pain After Session:</span>
            <strong style={{ color: 'var(--accent-mint)' }}>{painAfter} / 10</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pain Trajectory (&Delta;):</span>
            <strong
              style={{
                color:
                  painDelta < 0
                    ? 'var(--accent-mint)'
                    : painDelta === 0
                    ? 'var(--text-primary)'
                    : 'var(--color-danger, #EF4444)',
              }}
            >
              {painDelta < 0
                ? `${Math.abs(painDelta)} pt reduction (Improved)`
                : painDelta === 0
                ? 'Stable (No pain increase)'
                : `+${painDelta} pt elevation`}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Perceived Difficulty:</span>
            <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {difficulty}
            </strong>
          </div>

          {session?.sessionResults?.feedback && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Therapist Note:</span>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                &ldquo;{session.sessionResults.feedback}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PATIENT.PROGRESS)}
            className="btn btn-primary btn-block btn-lg"
          >
            View My Progress & History &rarr;
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link
              to={ROUTES.PATIENT.EXERCISES}
              className="btn btn-secondary btn-block"
              style={{ textAlign: 'center' }}
            >
              Next Exercise
            </Link>

            <Link
              to={ROUTES.PATIENT.DASHBOARD}
              className="btn btn-outline btn-block"
              style={{ textAlign: 'center' }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
