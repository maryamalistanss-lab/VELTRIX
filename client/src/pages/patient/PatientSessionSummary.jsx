import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card';
import { exerciseCatalog } from '../../data/exerciseMockData';
import { ROUTES } from '../../utils/constants';

/**
 * PatientSessionSummary Component
 * Replicates Screen 6 of Patient App in Image 1 & 2.
 */
export default function PatientSessionSummary() {
  const { exerciseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const feedbackState = location.state || {};
  const painAfter = feedbackState.painAfter || 2;
  const difficulty = feedbackState.difficulty || 'Moderate';

  const exercise =
    exerciseCatalog.find((ex) => ex.id === exerciseId) ||
    exerciseCatalog.find((ex) => ex.id === 'ex-knee-extension') ||
    exerciseCatalog[0];

  const handleSaveAndFinish = () => {
    navigate(ROUTES.PATIENT.PROGRESS);
  };

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
            marginBottom: 28,
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
            {exercise.title} &bull; Excellent consistency
          </p>
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
              3 / 3
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
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Repetitions</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              30 / 30
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
              08:45
            </div>
          </div>
        </div>

        {/* Clinical Pain & Tolerance Summary List */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--color-surface)',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pain Before Exercise:</span>
            <strong style={{ color: 'var(--text-primary)' }}>4 / 5</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pain After Exercise:</span>
            <strong style={{ color: 'var(--accent-mint)' }}>{painAfter} / 5</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Perceived Difficulty:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{difficulty}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={handleSaveAndFinish}
            className="btn btn-primary btn-block btn-lg"
          >
            Save Session & View Progress &rarr;
          </button>

          <Link
            to={ROUTES.PATIENT.DASHBOARD}
            className="btn btn-outline btn-block"
            style={{ textAlign: 'center' }}
          >
            Return to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
