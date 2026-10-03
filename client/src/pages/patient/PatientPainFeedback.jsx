import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../../components/Card';
import PainScaleSelector from '../../components/common/PainScaleSelector';
import sessionService from '../../services/sessionService';

/**
 * PatientPainFeedback Component
 * Submits real completed exercise session with pre/post pain and difficulty to POST /api/sessions.
 */
export default function PatientPainFeedback() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionState = location.state || {};
  const exerciseName = sessionState.exerciseName || 'Rehabilitation Exercise';
  const setsCompleted = sessionState.setsCompleted || 3;
  const repsCompleted = sessionState.repsCompleted || 10;
  const durationSeconds = sessionState.durationSeconds || 180;
  const painBefore = sessionState.painBefore !== undefined ? sessionState.painBefore : 2;

  const [painAfter, setPainAfter] = useState(1);
  const [difficulty, setDifficulty] = useState('moderate'); // 'easy' | 'moderate' | 'hard'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const notesText = notes.trim() || null;
    const payload = {
      exerciseId: sessionState.exerciseId || exerciseId,
      setsCompleted: Number(setsCompleted),
      repsCompleted: Number(repsCompleted),
      durationSeconds: Number(durationSeconds),
      painBefore: Number(painBefore),
      painAfter: Number(painAfter),
      perceivedDifficulty: difficulty, // 'easy' | 'moderate' | 'hard'
      notes: notesText, // Top-level notes field per backend ExerciseSession model
      sessionResults: {
        feedback: notesText || undefined, // Also stored in sessionResults.feedback for summary display
      },
    };

    try {
      const responseData = await sessionService.createSession(payload);

      if (responseData && responseData.success && responseData.data) {
        const savedSession = responseData.data;
        navigate(`/patient/exercises/${exerciseId}/summary`, {
          state: {
            session: savedSession,
            exerciseName,
          },
        });
      } else {
        setErrorMessage(responseData?.message || 'Failed to save exercise session.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Session logging error:', err);
      // 401 errors are handled globally by the API interceptor (auto-redirect to login)
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'The referenced exercise no longer exists. Please select a valid exercise.'
          : 'Unable to submit exercise session. Please verify your connection and try again.');
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to={`/patient/exercises/${exerciseId}/guided`}
          className="btn btn-ghost btn-sm"
        >
          &larr; Back to Session
        </Link>
      </div>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>📋</span>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 6 }}>
            Workout Complete!
          </h1>
          <p className="page-subtitle">
            How do you feel after completing <strong>{exerciseName}</strong>?
          </p>
        </div>

        {/* Pre-workout pain reference indicator */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--border-color)',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 14,
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Pre-Exercise Baseline Pain:</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
            {painBefore} / 10
          </strong>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger, #EF4444)',
              color: 'var(--color-danger, #EF4444)',
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Question 1: Pain after exercise */}
          <div style={{ marginBottom: 32 }}>
            <label
              className="form-label"
              style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontSize: 15 }}
            >
              Pain immediately after exercise (0 to 10):
            </label>
            <PainScaleSelector
              value={painAfter}
              onChange={setPainAfter}
              disabled={isSubmitting}
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
              How difficult was this session?
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {[
                { value: 'easy', label: 'Easy', desc: 'Minimal exertion, gentle and comfortable.' },
                { value: 'moderate', label: 'Moderate', desc: 'Appropriate challenge, steady fatigue.' },
                { value: 'hard', label: 'Hard', desc: 'Significant effort required, demanding.' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: difficulty === opt.value ? 'var(--primary-indigo)' : 'var(--border-color)',
                    background: difficulty === opt.value ? 'var(--primary-light)' : 'var(--color-surface)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={opt.value}
                    checked={difficulty === opt.value}
                    disabled={isSubmitting}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ accentColor: 'var(--primary-indigo)', marginTop: 3 }}
                  />
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {opt.label}
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Notes for Therapist */}
          <div style={{ marginBottom: 28 }}>
            <label className="form-label">
              Notes for your therapist (Optional):
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g., Felt comfortable during set 2, mild tightness on final repetition..."
              value={notes}
              disabled={isSubmitting}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block btn-lg"
          >
            {isSubmitting ? 'Logging Session to Database...' : 'Save & View Summary →'}
          </button>
        </form>
      </Card>
    </div>
  );
}
