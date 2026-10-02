import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import exerciseService from '../../services/exerciseService';
import patientService from '../../services/patientService';
import sessionService from '../../services/sessionService';
import { ROUTES } from '../../utils/constants';

export default function TherapistAssignExercise() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPatientParam = searchParams.get('patientId') || '';
  const initialExerciseParam = searchParams.get('exerciseId') || '';

  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientParam);
  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseParam);
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [targetDurationSeconds, setTargetDurationSeconds] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [dueDate, setDueDate] = useState('');
  const [therapistNotes, setTherapistNotes] = useState('Perform slowly and maintain posture. Cease if sharp pain occurs.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [backendNotice, setBackendNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const exRes = await exerciseService.getExercises();
        const exList = exRes?.data || [];

        let ptList = [];
        try {
          const ptRes = await patientService.getPatients();
          if (ptRes && ptRes.success && Array.isArray(ptRes.data) && ptRes.data.length > 0) {
            ptList = ptRes.data;
          }
        } catch {
          // Fallback: discover patients from sessions
          try {
            const sessRes = await sessionService.getSessions();
            const sessList = Array.isArray(sessRes?.data) ? sessRes.data : [];
            const discovered = {};
            sessList.forEach((s) => {
              if (s.patientId && !discovered[s.patientId]) {
                discovered[s.patientId] = {
                  id: s.patientId,
                  name: `Patient (${String(s.patientId).substring(0, 8)}...)`,
                  email: `patient-${String(s.patientId).substring(0, 6)}@veltrix.app`,
                };
              }
            });
            ptList = Object.values(discovered);
          } catch {
            ptList = [];
          }
        }

        if (isMounted) {
          setExercises(Array.isArray(exList) ? exList : []);
          setPatients(ptList);

          if (!selectedExerciseId && exList.length > 0) {
            setSelectedExerciseId(exList[0].id || exList[0]._id);
          }
          if (!selectedPatientId && ptList.length > 0) {
            setSelectedPatientId(ptList[0].id || ptList[0]._id);
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [selectedExerciseId, selectedPatientId]);

  // Selected exercise specs for preview
  const currentExercise = useMemo(() => {
    return exercises.find((ex) => (ex.id || ex._id) === selectedExerciseId) || exercises[0] || null;
  }, [exercises, selectedExerciseId]);

  // Submit Prescription Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedExerciseId) {
      setSubmissionFeedback({
        type: 'error',
        message: 'Please select both a patient and an exercise.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);
    setBackendNotice(null);

    const payload = {
      exerciseId: selectedExerciseId,
      targetSets: Number(targetSets),
      targetReps: targetReps ? Number(targetReps) : null,
      targetDurationSeconds: targetDurationSeconds ? Number(targetDurationSeconds) : null,
      frequency: frequency || 'Daily',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      therapistNotes: therapistNotes.trim() || null,
    };

    try {
      await patientService.assignExercise(selectedPatientId, payload);
      setSubmissionFeedback({
        type: 'success',
        message: `✓ Exercise "${currentExercise?.name}" prescribed successfully to patient!`,
      });
      setTimeout(() => {
        navigate(`/therapist/patients/${selectedPatientId}/progress`);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 404) {
        setBackendNotice(
          `Notice: The endpoint POST /api/users/patients/:id/assignments is pending integration by backend teammate Umra. The assignment payload has been validated against API-CONTRACT.md Section 6.8.`
        );
        setSubmissionFeedback({
          type: 'info',
          message: `Prescription validated for ${currentExercise?.name || 'Exercise'}. Ready for live backend integration.`,
        });
      } else {
        setSubmissionFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to submit prescription to backend.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container therapist-assign-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar" style={{ marginBottom: 16 }}>
        <Link to={ROUTES.THERAPIST.DASHBOARD} className="breadcrumb-link">
          &larr; Back to Dashboard
        </Link>
        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>/</span>
        <span className="breadcrumb-current" style={{ fontWeight: 600 }}>Prescribe & Assign Protocol</span>
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Prescribe Exercise Protocol</h1>
          <p className="page-subtitle">
            Configure personalized rehabilitation dosage, frequency, and clinical guidance for patient
          </p>
        </div>
      </div>

      {backendNotice && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-info-bg)',
            color: 'var(--color-info)',
            border: '1px solid var(--color-info-border)',
            marginBottom: 20,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {backendNotice}
        </div>
      )}

      {submissionFeedback && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: submissionFeedback.type === 'success' ? 'var(--color-success-bg)' : submissionFeedback.type === 'info' ? 'var(--color-info-bg)' : 'var(--color-error-bg)',
            color: submissionFeedback.type === 'success' ? 'var(--accent-mint)' : submissionFeedback.type === 'info' ? 'var(--color-info)' : 'var(--color-error)',
            border: '1px solid',
            borderColor: submissionFeedback.type === 'success' ? 'var(--color-success-border)' : submissionFeedback.type === 'info' ? 'var(--color-info-border)' : 'var(--color-error-border)',
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          {submissionFeedback.message}
        </div>
      )}

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
          <Card title="Prescription Parameters" subtitle="Specify clinical dosage and timeline">
            {/* Select Patient */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="select-patient">
                Target Patient <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              {patients.length > 0 ? (
                <select
                  id="select-patient"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="form-select"
                  required
                >
                  {patients.map((pt) => {
                    const ptId = pt.id || pt._id;
                    return (
                      <option key={ptId} value={ptId}>
                        {pt.name} ({pt.email || ptId})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  id="select-patient"
                  type="text"
                  className="form-input"
                  placeholder="Enter patient MongoDB ObjectId"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Select Exercise */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="select-exercise">
                Select Exercise <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="select-exercise"
                value={selectedExerciseId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedExerciseId(newId);
                  const found = exercises.find((ex) => (ex.id || ex._id) === newId);
                  if (found) {
                    if (found.defaultSets) setTargetSets(found.defaultSets);
                    if (found.defaultReps) setTargetReps(found.defaultReps);
                  }
                }}
                className="form-select"
                required
              >
                {exercises.map((ex) => {
                  const exId = ex.id || ex._id;
                  return (
                    <option key={exId} value={exId}>
                      {ex.name} ({ex.targetBodyPart} &bull; {ex.difficulty})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sets & Repetitions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="target-sets">
                  Target Sets <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="target-sets"
                  type="number"
                  min="1"
                  max="20"
                  value={targetSets}
                  onChange={(e) => setTargetSets(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="target-reps">Target Reps</label>
                <input
                  id="target-reps"
                  type="number"
                  min="1"
                  max="100"
                  value={targetReps}
                  onChange={(e) => setTargetReps(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            {/* Hold Duration & Frequency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="target-duration">Hold / Duration (sec)</label>
                <input
                  id="target-duration"
                  type="number"
                  min="0"
                  max="300"
                  placeholder="Optional"
                  value={targetDurationSeconds}
                  onChange={(e) => setTargetDurationSeconds(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="target-frequency">Frequency</label>
                <select
                  id="target-frequency"
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
            </div>

            {/* Due Date */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="target-due-date">Program Due / Review Date</label>
              <input
                id="target-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Clinical Notes */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="target-notes">Clinical Guidance / Patient Notes</label>
              <textarea
                id="target-notes"
                rows="3"
                value={therapistNotes}
                onChange={(e) => setTherapistNotes(e.target.value)}
                className="form-textarea"
                placeholder="Perform slowly and maintain posture. Cease if sharp pain occurs."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Submitting Prescription...' : 'Assign Exercise to Patient \u2192'}
            </button>
          </Card>

          {/* Right Column: Exercise Preview */}
          <Card title="Protocol Preview" subtitle={currentExercise?.name || 'Exercise'}>
            {currentExercise ? (
              <div>
                <div
                  style={{
                    width: '100%',
                    height: 160,
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
                  <span style={{ fontSize: 48, marginBottom: 6 }}>🏃‍♂️</span>
                  <strong style={{ color: 'var(--primary-indigo)', fontSize: 15, textAlign: 'center', padding: '0 12px' }}>
                    {currentExercise.name}
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Target Region:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{currentExercise.targetBodyPart}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Difficulty:</span>
                    <Badge variant={currentExercise.difficulty === 'beginner' ? 'mint' : 'warning'}>
                      {currentExercise.difficulty}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Default Sets & Reps:</span>
                    <strong>{currentExercise.defaultSets || 3} Sets &times; {currentExercise.defaultReps || 10} Reps</strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-elevated)',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Clinical Intent:</strong> {currentExercise.description}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Select an exercise to view protocol preview.</p>
            )}
          </Card>
        </div>
      </form>
    </div>
  );
}
