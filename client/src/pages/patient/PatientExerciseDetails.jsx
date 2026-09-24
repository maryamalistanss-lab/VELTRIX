import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { exerciseCatalog } from '../../data/exerciseMockData';
import { ROUTES } from '../../utils/constants';

/**
 * PatientExerciseDetails Component
 * Replicates Screen 3 of Patient App in Image 1 & 2.
 */
export default function PatientExerciseDetails() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // Find exercise or fallback to Knee Extension
  const exercise =
    exerciseCatalog.find((ex) => ex.id === exerciseId) ||
    exerciseCatalog.find((ex) => ex.id === 'ex-knee-extension') ||
    exerciseCatalog[0];

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      {/* Back Navigation & Title Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <Link
          to={ROUTES.PATIENT.DASHBOARD}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          &larr; Back to Dashboard
        </Link>

        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="btn btn-outline btn-icon-only"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{ color: isFavorite ? '#EF4444' : 'var(--text-muted)' }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Main Exercise Card */}
      <Card>
        {/* Title & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 className="page-title" style={{ fontSize: 24 }}>{exercise.title}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="info">{exercise.targetArea || exercise.bodyPart}</Badge>
            <Badge variant="mint">{exercise.difficulty}</Badge>
          </div>
        </div>

        {/* Visual Exercise Demonstration Preview Box */}
        <div
          style={{
            width: '100%',
            height: 240,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Posture demonstration graphic */}
          <div style={{ fontSize: 64, marginBottom: 8 }}>🪑🦵</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-indigo)' }}>
            {exercise.title} Movement Visual Guide
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Proper sagittal posture alignment &bull; Controlled cadence
          </span>
        </div>

        {/* Prescription Parameters Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-elevated)',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sets</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {exercise.sets}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Repetitions</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {exercise.reps}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rest Time</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {exercise.restTime}
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            Instructions:
          </h3>
          <ol
            style={{
              paddingLeft: 20,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {exercise.instructions.map((step, idx) => (
              <li key={idx}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Choose Mode Section (Guided vs Camera Mode) */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            Choose Mode:
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            {/* Guided Mode (Mint button) */}
            <button
              type="button"
              onClick={() => navigate(`/patient/exercises/${exercise.id}/guided`)}
              className="btn btn-secondary btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span>🧭</span>
              <span>Guided Mode</span>
            </button>

            {/* Camera Mode (Beta tag) */}
            <button
              type="button"
              onClick={() => navigate(`/patient/exercises/${exercise.id}/session?mode=camera`)}
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span>📷</span>
              <span>Camera Mode</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  marginLeft: 4,
                }}
              >
                Beta
              </span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
