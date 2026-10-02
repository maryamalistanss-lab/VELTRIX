import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import exerciseService from '../../services/exerciseService';
import { ROUTES } from '../../utils/constants';

export default function TherapistExerciseDetails() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetBodyPart: '',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 10,
    defaultDurationSeconds: '',
    instructionsText: '',
    demonstrationMedia: '',
    safetyInstructions: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExercise = useCallback(async () => {
    if (!exerciseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await exerciseService.getExerciseById(exerciseId);
      if (response && response.success && response.data) {
        setExercise(response.data);
      } else {
        setError('Exercise not found in database.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retrieve exercise details.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!exerciseId) return;
      try {
        const response = await exerciseService.getExerciseById(exerciseId);
        if (isMounted) {
          if (response && response.success && response.data) {
            setExercise(response.data);
          } else {
            setError('Exercise not found in database.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to retrieve exercise details.');
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  const handleOpenEdit = () => {
    if (!exercise) return;
    const instructionsStr = Array.isArray(exercise.instructions)
      ? exercise.instructions.join('\n')
      : exercise.instructions || '';

    setFormData({
      name: exercise.name || '',
      description: exercise.description || '',
      targetBodyPart: exercise.targetBodyPart || '',
      difficulty: exercise.difficulty || 'beginner',
      defaultSets: exercise.defaultSets ?? 3,
      defaultReps: exercise.defaultReps ?? 10,
      defaultDurationSeconds: exercise.defaultDurationSeconds ?? '',
      instructionsText: instructionsStr,
      demonstrationMedia: exercise.demonstrationMedia || '',
      safetyInstructions: exercise.safetyInstructions || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.targetBodyPart.trim()) errors.targetBodyPart = 'Target body part is required';

    const instructionsArray = formData.instructionsText
      .split('\n')
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter((line) => line.length > 0);

    if (instructionsArray.length === 0) {
      errors.instructionsText = 'At least one instruction step is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        targetBodyPart: formData.targetBodyPart.trim(),
        difficulty: formData.difficulty,
        defaultSets: formData.defaultSets ? Number(formData.defaultSets) : null,
        defaultReps: formData.defaultReps ? Number(formData.defaultReps) : null,
        defaultDurationSeconds: formData.defaultDurationSeconds ? Number(formData.defaultDurationSeconds) : null,
        instructions: instructionsArray,
        demonstrationMedia: formData.demonstrationMedia.trim() || null,
        safetyInstructions: formData.safetyInstructions.trim() || null,
      };

      await exerciseService.updateExercise(exerciseId, payload);
      setSuccessMessage('✓ Exercise updated successfully in database.');
      setIsEditModalOpen(false);
      await fetchExercise();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to update exercise.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await exerciseService.deleteExercise(exerciseId);
      navigate(ROUTES.THERAPIST.EXERCISES);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exercise.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary-indigo)',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-secondary)' }}>Loading exercise specifications...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="page-container">
        <div className="breadcrumb-bar" style={{ marginBottom: 16 }}>
          <Link to={ROUTES.THERAPIST.EXERCISES} className="breadcrumb-link">
            &larr; Back to Exercise Library
          </Link>
        </div>
        <div
          style={{
            padding: '32px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>⚠️</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {error || 'Exercise Not Found'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            The requested exercise ID could not be loaded from the database catalog.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button type="button" onClick={fetchExercise} className="btn btn-primary">
              Retry
            </button>
            <Link to={ROUTES.THERAPIST.EXERCISES} className="btn btn-outline">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const diff = (exercise.difficulty || 'beginner').toLowerCase();
  const badgeVariant = diff === 'beginner' ? 'mint' : diff === 'intermediate' ? 'warning' : 'danger';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar" style={{ marginBottom: 20 }}>
        <Link to={ROUTES.THERAPIST.EXERCISES} className="breadcrumb-link">
          &larr; Back to Exercise Library
        </Link>
        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>/</span>
        <span className="breadcrumb-current" style={{ fontWeight: 600 }}>{exercise.name}</span>
      </div>

      {successMessage && (
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
          {successMessage}
        </div>
      )}

      {/* Header Banner */}
      <div
        className="patient-header-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: 24 }}>
              {exercise.name}
            </h1>
            <Badge variant={badgeVariant}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </Badge>
            <span className="badge badge-info" style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary-indigo)', fontWeight: 600, fontSize: 12 }}>
              {exercise.targetBodyPart}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Database Record ID: <code>{exercise.id || exercise._id}</code> &bull; Created: {exercise.createdAt ? new Date(exercise.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenEdit}
            className="btn btn-outline"
          >
            Edit Protocol
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-outline"
            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
          >
            Delete
          </button>
          <Link
            to={`${ROUTES.THERAPIST.ASSIGN}?exerciseId=${exercise.id || exercise._id}`}
            className="btn btn-primary"
          >
            + Prescribe to Patient
          </Link>
        </div>
      </div>

      {/* Exercise Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Clinical Overview */}
        <Card title="Clinical Overview" subtitle="Anatomical targets and therapeutic protocol">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            {exercise.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Body Region:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{exercise.targetBodyPart}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Difficulty Classification:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Default Dosage:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {exercise.defaultSets ?? 3} Sets &times; {exercise.defaultReps ? `${exercise.defaultReps} Reps` : exercise.defaultDurationSeconds ? `${exercise.defaultDurationSeconds}s` : 'Standard'}
              </strong>
            </div>

            {exercise.defaultDurationSeconds && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Hold / Set Duration:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{exercise.defaultDurationSeconds} seconds</strong>
              </div>
            )}
          </div>
        </Card>

        {/* Safety & Demonstration */}
        <Card title="Clinical Safety & Media Guidance" subtitle="Patient safety guidelines and visual media">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>Safety Instructions:</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {exercise.safetyInstructions || 'No specific contraindications recorded. Patients should cease exercise immediately upon sharp discomfort.'}
              </p>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>🎥</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>Demonstration Media:</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {exercise.demonstrationMedia ? (
                  <a
                    href={exercise.demonstrationMedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-indigo)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    {exercise.demonstrationMedia}
                  </a>
                ) : (
                  'Standard in-clinic motion demonstration provided during guided mode.'
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Step-by-Step Instructions */}
      <Card title="Step-by-Step Patient Execution Instructions" subtitle="Clinical instructions rendered to patients during rehabilitation">
        {Array.isArray(exercise.instructions) && exercise.instructions.length > 0 ? (
          <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {exercise.instructions.map((step, idx) => (
              <li key={idx} style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}>Step {idx + 1}: </span>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {typeof exercise.instructions === 'string' ? exercise.instructions : 'No structured steps provided.'}
          </p>
        )}
      </Card>

      {/* ================= EDIT MODAL ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Edit Exercise Specifications"
        maxWidth="640px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit}>
          {formErrors.submit && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              ⚠️ {formErrors.submit}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="edit-ex-name">Exercise Name</label>
            <input
              id="edit-ex-name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {formErrors.name && <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.name}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="edit-ex-desc">Description</label>
            <textarea
              id="edit-ex-desc"
              rows="2"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {formErrors.description && <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.description}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-ex-bodypart">Target Body Part</label>
              <input
                id="edit-ex-bodypart"
                type="text"
                className="form-input"
                value={formData.targetBodyPart}
                onChange={(e) => setFormData({ ...formData, targetBodyPart: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-ex-diff">Difficulty</label>
              <select
                id="edit-ex-diff"
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-ex-sets">Default Sets</label>
              <input
                id="edit-ex-sets"
                type="number"
                min="1"
                className="form-input"
                value={formData.defaultSets}
                onChange={(e) => setFormData({ ...formData, defaultSets: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-ex-reps">Default Reps</label>
              <input
                id="edit-ex-reps"
                type="number"
                min="1"
                className="form-input"
                value={formData.defaultReps}
                onChange={(e) => setFormData({ ...formData, defaultReps: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="edit-ex-inst">Instructions (one per line)</label>
            <textarea
              id="edit-ex-inst"
              rows="4"
              className="form-textarea"
              value={formData.instructionsText}
              onChange={(e) => setFormData({ ...formData, instructionsText: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-ex-safe">Safety Instructions</label>
            <input
              id="edit-ex-safe"
              type="text"
              className="form-input"
              value={formData.safetyInstructions}
              onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* ================= DELETE MODAL ================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        maxWidth="460px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Exercise'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: 14 }}>
          Are you sure you want to permanently delete <strong>&ldquo;{exercise.name}&rdquo;</strong>?
        </p>
      </Modal>
    </div>
  );
}
