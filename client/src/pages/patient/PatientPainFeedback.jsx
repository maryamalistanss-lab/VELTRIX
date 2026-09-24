import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card';
import PainScaleSelector from '../../components/common/PainScaleSelector';
import { exerciseCatalog } from '../../data/exerciseMockData';

/**
 * PatientPainFeedback Component
 * Replicates Screen 5 of Patient App in Image 1 & 2 (Pain & Difficulty).
 */
export default function PatientPainFeedback() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [painLevel, setPainLevel] = useState(3);
  const [difficulty, setDifficulty] = useState('Moderate');
  const [notes, setNotes] = useState('');

  const exercise =
    exerciseCatalog.find((ex) => ex.id === exerciseId) ||
    exerciseCatalog.find((ex) => ex.id === 'ex-knee-extension') ||
    exerciseCatalog[0];

  const handleContinue = (e) => {
    e.preventDefault();
    navigate(`/patient/exercises/${exercise.id}/summary`, {
      state: {
        painAfter: painLevel,
        difficulty,
        notes,
      },
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to={`/patient/exercises/${exercise.id}/guided`}
          className="btn btn-ghost btn-sm"
        >
          &larr; Back to Session
        </Link>
      </div>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 6 }}>
            How do you feel?
          </h1>
          <p className="page-subtitle">
            Please provide your feedback. We care about your recovery comfort.
          </p>
        </div>

        <form onSubmit={handleContinue}>
          {/* Question 1: Pain after exercise */}
          <div style={{ marginBottom: 32 }}>
            <label
              className="form-label"
              style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontSize: 15 }}
            >
              Pain after exercise:
            </label>
            <PainScaleSelector
              value={painLevel}
              onChange={setPainLevel}
            />
          </div>

          {/* Question 2: Difficulty Level */}
          <div
            style={{
              marginBottom: 32,
              borderTop: '1px solid var(--border-color)',
              paddingTop: 24,
            }}
          >
            <label
              className="form-label"
              style={{ display: 'block', marginBottom: 14, fontSize: 15 }}
            >
              How difficult was it?
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {['Easy', 'Moderate', 'Difficult'].map((level) => (
                <label
                  key={level}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: difficulty === level ? 'var(--primary-indigo)' : 'var(--border-color)',
                    background: difficulty === level ? 'var(--primary-light)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ accentColor: 'var(--primary-indigo)' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Notes for Therapist */}
          <div style={{ marginBottom: 28 }}>
            <label className="form-label">
              Any notes for your therapist? (Optional)
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Mild stiffness during second set..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Continue Action Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
          >
            Continue &rarr;
          </button>
        </form>
      </Card>
    </div>
  );
}
