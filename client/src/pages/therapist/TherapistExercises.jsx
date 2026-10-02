import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import exerciseService from '../../services/exerciseService';
import { ROUTES } from '../../utils/constants';

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  targetBodyPart: 'Knees',
  difficulty: 'beginner',
  defaultSets: 3,
  defaultReps: 10,
  defaultDurationSeconds: '',
  instructionsText: '1. Sit upright with back supported.\n2. Slowly extend leg straight out.\n3. Pause for 2 seconds and lower smoothly.',
  demonstrationMedia: '',
  safetyInstructions: 'Stop immediately if sharp pain occurs.',
};

const BODY_PART_OPTIONS = ['ALL', 'Knees', 'Shoulders', 'Chest', 'Legs', 'Neck', 'Spine', 'Hips', 'Ankles'];
const DIFFICULTY_OPTIONS = ['ALL', 'beginner', 'intermediate', 'advanced'];

export default function TherapistExercises() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingExercise, setDeletingExercise] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-fetch exercises
  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await exerciseService.getExercises();
      if (response && response.success && Array.isArray(response.data)) {
        setExercises(response.data);
      } else {
        setExercises(response?.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load exercises from backend repository.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      try {
        const response = await exerciseService.getExercises();
        if (isMounted) {
          if (response && response.success && Array.isArray(response.data)) {
            setExercises(response.data);
          } else {
            setExercises(response?.data || []);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.response?.data?.message || 'Failed to load exercises from backend repository.');
          setIsLoading(false);
        }
      }
    }
    initFetch();
    return () => {
      isMounted = false;
    };
  }, []);

  // Flash action message
  const showFlash = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExerciseId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exercise) => {
    setEditingExerciseId(exercise.id || exercise._id);
    const instructionsStr = Array.isArray(exercise.instructions)
      ? exercise.instructions.join('\n')
      : exercise.instructions || '';

    setFormData({
      name: exercise.name || '',
      description: exercise.description || '',
      targetBodyPart: exercise.targetBodyPart || 'Knees',
      difficulty: exercise.difficulty || 'beginner',
      defaultSets: exercise.defaultSets ?? 3,
      defaultReps: exercise.defaultReps ?? 10,
      defaultDurationSeconds: exercise.defaultDurationSeconds ?? '',
      instructionsText: instructionsStr,
      demonstrationMedia: exercise.demonstrationMedia || '',
      safetyInstructions: exercise.safetyInstructions || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Exercise name is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.targetBodyPart.trim()) errors.targetBodyPart = 'Target body part is required.';
    if (!['beginner', 'intermediate', 'advanced'].includes(formData.difficulty)) {
      errors.difficulty = 'Valid difficulty level is required.';
    }

    const parsedInstructions = formData.instructionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (parsedInstructions.length === 0) {
      errors.instructionsText = 'At least one instruction step is required.';
    }

    if (formData.defaultSets !== '' && Number(formData.defaultSets) < 1) {
      errors.defaultSets = 'Sets must be at least 1.';
    }
    if (formData.defaultReps !== '' && Number(formData.defaultReps) < 1) {
      errors.defaultReps = 'Reps must be at least 1.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Exercise (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    const instructionsArray = formData.instructionsText
      .split('\n')
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter((line) => line.length > 0);

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

    try {
      if (editingExerciseId) {
        await exerciseService.updateExercise(editingExerciseId, payload);
        showFlash(`✓ Exercise "${payload.name}" updated successfully.`);
      } else {
        await exerciseService.createExercise(payload);
        showFlash(`✓ Exercise "${payload.name}" created and added to database.`);
      }
      setIsModalOpen(false);
      await loadExercises();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save exercise to backend.';
      setFormErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete exercise handler
  const handleConfirmDelete = async () => {
    if (!deletingExercise) return;
    const exerciseId = deletingExercise.id || deletingExercise._id;
    const exerciseName = deletingExercise.name;

    setIsDeleting(true);
    try {
      await exerciseService.deleteExercise(exerciseId);
      showFlash(`✓ Exercise "${exerciseName}" deleted successfully.`);
      setDeletingExercise(null);
      await loadExercises();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete exercise from backend.';
      setApiError(msg);
      setDeletingExercise(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const name = ex.name || '';
      const bodyPart = ex.targetBodyPart || '';
      const difficulty = ex.difficulty || '';

      const matchSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bodyPart.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPart = selectedBodyPart === 'ALL' || bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
      const matchDiff = selectedDifficulty === 'ALL' || difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchSearch && matchPart && matchDiff;
    });
  }, [exercises, searchTerm, selectedBodyPart, selectedDifficulty]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / itemsPerPage));
  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExercises.slice(start, start + itemsPerPage);
  }, [filteredExercises, currentPage]);

  return (
    <div className="page-container therapist-exercises-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Exercise Management</h1>
          <p className="page-subtitle">
            Rehabilitation exercise catalog &bull; Real-time database protocols and clinical guidelines
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            aria-label="Add new exercise"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            color: 'var(--accent-mint)',
            border: '1px solid var(--color-success-border)',
            marginBottom: 20,
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionSuccessMessage}</span>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* API Error Alert */}
      {apiError && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error-border)',
            marginBottom: 20,
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {apiError}</span>
          <button
            type="button"
            onClick={loadExercises}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
          >
            Retry
          </button>
        </div>
      )}

      <Card>
        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div className="topbar-search-wrapper" style={{ width: 300 }}>
            <span className="topbar-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search exercise name or target..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="topbar-search-input"
              aria-label="Search exercises"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Body Part Dropdown */}
            <div style={{ minWidth: 160 }}>
              <select
                value={selectedBodyPart}
                onChange={(e) => {
                  setSelectedBodyPart(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
                aria-label="Filter by body part"
              >
                {BODY_PART_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'All Body Parts' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <div style={{ minWidth: 150 }}>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
                aria-label="Filter by difficulty"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--primary-indigo)',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ fontWeight: 500 }}>Connecting to exercise repository...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-elevated)',
              margin: '12px 0',
            }}
          >
            <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>🏋️‍♂️</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No Exercises Found
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 18px auto' }}>
              {searchTerm || selectedBodyPart !== 'ALL' || selectedDifficulty !== 'ALL'
                ? 'No exercises match the selected filters. Try adjusting your search criteria.'
                : 'The exercise database is currently empty. Click below to add your first clinical protocol.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn btn-primary"
            >
              + Add Exercise Protocol
            </button>
          </div>
        ) : (
          /* Exercises Management Table */
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Body Part</th>
                  <th>Difficulty</th>
                  <th>Default Sets</th>
                  <th>Default Reps</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExercises.map((ex) => {
                  const exId = ex.id || ex._id;
                  const diff = (ex.difficulty || 'beginner').toLowerCase();
                  const badgeVariant =
                    diff === 'beginner' ? 'mint' : diff === 'intermediate' ? 'warning' : 'danger';

                  return (
                    <tr key={exId}>
                      {/* Exercise Name with icon */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--primary-light)',
                              color: 'var(--primary-indigo)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              flexShrink: 0,
                            }}
                          >
                            🏃‍♂️
                          </div>
                          <div>
                            <Link
                              to={`/therapist/exercises/${exId}`}
                              style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}
                            >
                              {ex.name}
                            </Link>
                            {ex.description && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: 'var(--text-muted)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {ex.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>{ex.targetBodyPart}</td>

                      <td>
                        <Badge variant={badgeVariant}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Badge>
                      </td>

                      <td style={{ fontWeight: 600 }}>{ex.defaultSets ?? '—'}</td>
                      <td>{ex.defaultReps ? `${ex.defaultReps} reps` : ex.defaultDurationSeconds ? `${ex.defaultDurationSeconds}s` : '—'}</td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link
                            to={`/therapist/exercises/${exId}`}
                            className="btn btn-outline btn-sm"
                            title="View exercise details"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ex)}
                            className="btn btn-outline btn-sm"
                            title="Edit exercise"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingExercise(ex)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                            title="Delete exercise"
                          >
                            Delete
                          </button>
                          <Link
                            to={`${ROUTES.THERAPIST.ASSIGN}?exerciseId=${exId}`}
                            className="btn btn-primary btn-sm"
                            title="Prescribe to Patient"
                          >
                            Prescribe
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredExercises.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              marginTop: 8,
              fontSize: 13,
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredExercises.length)} of{' '}
              {filteredExercises.length} exercises
            </span>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn btn-outline btn-sm"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                    style={{ minWidth: 32 }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-outline btn-sm"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ================= ADD / EDIT EXERCISE MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingExerciseId ? 'Edit Clinical Exercise' : 'Add New Clinical Exercise'}
        maxWidth="640px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitForm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving to Database...'
                : editingExerciseId
                ? 'Update Exercise'
                : 'Create Exercise'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm}>
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

          {/* Exercise Name */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="ex-name">
              Exercise Name <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="ex-name"
              type="text"
              className="form-input"
              placeholder="e.g. Seated Knee Extension"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {formErrors.name && (
              <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="ex-desc">
              Clinical Description <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="ex-desc"
              rows="2"
              className="form-textarea"
              placeholder="Describe the clinical intent, target muscle group, or recovery goal..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {formErrors.description && (
              <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.description}</span>
            )}
          </div>

          {/* Body Part & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ex-bodypart">
                Target Body Part <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="ex-bodypart"
                type="text"
                className="form-input"
                placeholder="e.g. Knee, Shoulder, Spine"
                value={formData.targetBodyPart}
                onChange={(e) => setFormData({ ...formData, targetBodyPart: e.target.value })}
                required
              />
              {formErrors.targetBodyPart && (
                <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.targetBodyPart}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-difficulty">
                Difficulty Level <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="ex-difficulty"
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

          {/* Sets, Reps, Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ex-sets">Default Sets</label>
              <input
                id="ex-sets"
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={formData.defaultSets}
                onChange={(e) => setFormData({ ...formData, defaultSets: e.target.value })}
              />
              {formErrors.defaultSets && (
                <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.defaultSets}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-reps">Default Reps</label>
              <input
                id="ex-reps"
                type="number"
                min="1"
                max="100"
                className="form-input"
                value={formData.defaultReps}
                onChange={(e) => setFormData({ ...formData, defaultReps: e.target.value })}
              />
              {formErrors.defaultReps && (
                <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.defaultReps}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-duration">Duration (sec)</label>
              <input
                id="ex-duration"
                type="number"
                min="1"
                max="3600"
                className="form-input"
                placeholder="Optional"
                value={formData.defaultDurationSeconds}
                onChange={(e) => setFormData({ ...formData, defaultDurationSeconds: e.target.value })}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="ex-instructions">
              Step-by-Step Instructions (one per line) <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="ex-instructions"
              rows="4"
              className="form-textarea"
              placeholder="Step 1: Sit tall with back supported&#10;Step 2: Slowly extend leg straight out&#10;Step 3: Hold 2s and lower smoothly"
              value={formData.instructionsText}
              onChange={(e) => setFormData({ ...formData, instructionsText: e.target.value })}
              required
            />
            {formErrors.instructionsText && (
              <span style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.instructionsText}</span>
            )}
          </div>

          {/* Safety & Demonstration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ex-safety">Safety Precautions</label>
              <input
                id="ex-safety"
                type="text"
                className="form-input"
                placeholder="e.g. Stop if sharp knee pain occurs"
                value={formData.safetyInstructions}
                onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-media">Demo Media URL (optional)</label>
              <input
                id="ex-media"
                type="text"
                className="form-input"
                placeholder="https://assets.example.com/demo.mp4"
                value={formData.demonstrationMedia}
                onChange={(e) => setFormData({ ...formData, demonstrationMedia: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={Boolean(deletingExercise)}
        onClose={() => !isDeleting && setDeletingExercise(null)}
        title="Confirm Exercise Deletion"
        maxWidth="480px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setDeletingExercise(null)}
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
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          Are you sure you want to permanently delete the exercise{' '}
          <strong>&ldquo;{deletingExercise?.name}&rdquo;</strong> from the database catalog?
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>
          This action will permanently remove the record from MongoDB. Existing completed session history referencing this exercise will be preserved.
        </p>
      </Modal>
    </div>
  );
}
