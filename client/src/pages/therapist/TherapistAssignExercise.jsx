import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { exerciseCatalog } from '../../data/exerciseMockData';
import { clinicalPatientDirectory } from '../../data/therapistMockData';

/**
 * TherapistAssignExercise Component
 * Replicates Screen 5 of Therapist App in Image 1 & 2.
 */
export default function TherapistAssignExercise() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const patients = clinicalPatientDirectory;
  const exercises = exerciseCatalog;

  const [selectedPatientId, setSelectedPatientId] = useState(patientId || 'pt-101');
  const [selectedExerciseId, setSelectedExerciseId] = useState('ex-arm-raise');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [frequency, setFrequency] = useState('Daily');
  const [startDate, setStartDate] = useState('2024-05-24');
  const [endDate, setEndDate] = useState('2024-05-31');
  const [notes, setNotes] = useState('Perform slowly and maintain posture. Report any pain.');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentExercise =
    exercises.find((ex) => ex.id === selectedExerciseId) || exercises[0];
  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate(`/therapist/patients/${selectedPatientId}/progress`);
    }, 1200);
  };

  return (
    <div className="page-container therapist-assign-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Assign Exercise</h1>
          <p className="page-subtitle">
            Prescribe targeted rehabilitation exercises and customize cadence
          </p>
        </div>
      </div>

      {isSuccess && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            color: 'var(--accent-mint)',
            border: '1px solid var(--color-success-border)',
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          ✓ Exercise successfully assigned to {currentPatient.name}! Redirecting...
        </div>
      )}

      {/* 2-Column Layout matching Image 1 & 2 Screen 5 */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 24,
          }}
          className="dashboard-columns-grid"
        >
          {/* Left Column: Form Fields */}
          <Card title="Prescription Parameters">
            {/* Select Patient */}
            <div className="form-group">
              <label className="form-label">Select Patient:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="form-select"
              >
                {patients.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({pt.condition})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Exercise */}
            <div className="form-group">
              <label className="form-label">Select Exercise:</label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="form-select"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.bodyPart})
                  </option>
                ))}
              </select>
            </div>

            {/* Sets & Repetitions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Sets:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repetitions:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Frequency */}
            <div className="form-group">
              <label className="form-label">Frequency:</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="form-select"
              >
                <option value="Daily">Daily</option>
                <option value="2x Daily">2x Daily (Morning / Evening)</option>
                <option value="3x Weekly">3x Weekly</option>
                <option value="Every other day">Every other day</option>
              </select>
            </div>

            {/* Start Date & End Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date (Optional):</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Notes (Optional) */}
            <div className="form-group">
              <label className="form-label">Notes (Optional):</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                placeholder="Perform slowly and maintain posture. Report any pain."
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-block btn-lg">
                Assign Exercise &rarr;
              </button>
            </div>
          </Card>

          {/* Right Column: Exercise Preview */}
          <Card title="Exercise Preview" subtitle={currentExercise.title}>
            {/* Visual Guide Graphic */}
            <div
              style={{
                width: '100%',
                height: 180,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: 56, marginBottom: 6 }}>🏃‍♂️</span>
              <strong style={{ color: 'var(--primary-indigo)', fontSize: 15 }}>
                {currentExercise.title}
              </strong>
            </div>

            {/* Preview Specs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Body Part:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{currentExercise.bodyPart}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Difficulty:</span>
                <Badge variant={currentExercise.difficulty === 'Beginner' ? 'mint' : 'warning'}>
                  {currentExercise.difficulty}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Default Sets:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{currentExercise.sets}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Equipment:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{currentExercise.equipment || 'None'}</strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong>Description:</strong> {currentExercise.description}
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
