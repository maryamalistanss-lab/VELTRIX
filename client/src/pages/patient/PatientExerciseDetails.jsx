import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';
import { getExerciseCameraConfig } from '../../utils/camera/poseDetectorConfig';

/**
 * PatientExerciseDetails Component
 * Displays complete exercise clinical details from real MongoDB Exercise entity.
 */
export default function PatientExerciseDetails() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/exercises/${exerciseId}`);
      if (response.data && response.data.success && response.data.data) {
        setExercise(response.data.data);
      } else {
        setError('Exercise not found.');
      }
    } catch (err) {
      console.error('Failed to fetch exercise details:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load exercise details. The requested exercise may not exist.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialExercise() {
      try {
        const response = await api.get(`/exercises/${exerciseId}`);
        if (isMounted) {
          if (response.data && response.data.success && response.data.data) {
            setExercise(response.data.data);
          } else {
            setError('Exercise not found.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch exercise details:', err);
          setError(
            err.response?.data?.message ||
            'Unable to load exercise details. The requested exercise may not exist.'
          );
          setIsLoading(false);
        }
      }
    }

    if (exerciseId) {
      loadInitialExercise();
    }
    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ maxWidth: 860, textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading exercise details...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="page-container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 20 }}>
          <Link to={ROUTES.PATIENT.EXERCISES} className="btn btn-ghost btn-sm">
            &larr; Back to Exercises
          </Link>
        </div>
        <Card style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--color-danger, #EF4444)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Exercise Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error || 'Exercise details unavailable.'}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button type="button" onClick={fetchExercise} className="btn btn-primary">
              Retry
            </button>
            <Link to={ROUTES.PATIENT.EXERCISES} className="btn btn-outline">
              Back to Catalog
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const exerciseTitle = exercise.name || exercise.title;
  const targetArea = exercise.targetBodyPart || exercise.bodyPart || 'Target Joint';
  const difficulty = exercise.difficulty || 'beginner';
  const sets = exercise.defaultSets || 3;
  const reps = exercise.defaultReps || 10;
  const durationText = exercise.defaultDurationSeconds
    ? `${Math.round(exercise.defaultDurationSeconds / 60)} mins`
    : '5 mins';
  const instructions = Array.isArray(exercise.instructions) ? exercise.instructions : [];

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
          to={ROUTES.PATIENT.EXERCISES}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          &larr; Back to Exercises
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
          <h1 className="page-title" style={{ fontSize: 24 }}>{exerciseTitle}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="info">{targetArea}</Badge>
            <Badge variant="mint">{difficulty}</Badge>
          </div>
        </div>

        {/* Visual Exercise Demonstration Preview Box */}
        <div
          style={{
            width: '100%',
            minHeight: 240,
            maxHeight: 360,
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
          {(() => {
            const demoSrc =
              exercise.demonstrationMedia ||
              exercise.demonstration ||
              (() => {
                const norm = (exercise.name || exercise.title || '').toLowerCase();
                if (norm.includes('squat')) return '/images/exercises/squat.svg';
                if (norm.includes('arm')) return '/images/exercises/arm-raise.svg';
                if (norm.includes('knee') || norm.includes('extension')) return '/images/exercises/seated-knee-extension.svg';
                if (norm.includes('push')) return '/images/exercises/wall-push-ups.svg';
                return null;
              })();

            if (demoSrc) {
              return (
                <img
                  src={demoSrc}
                  alt={`${exerciseTitle} demonstration`}
                  style={{
                    width: '100%',
                    maxHeight: 360,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const norm = (exercise.name || exercise.title || '').toLowerCase();
                    let fallback = '/images/exercises/squat.svg';
                    if (norm.includes('arm')) fallback = '/images/exercises/arm-raise.svg';
                    else if (norm.includes('knee') || norm.includes('extension')) fallback = '/images/exercises/seated-knee-extension.svg';
                    else if (norm.includes('push')) fallback = '/images/exercises/wall-push-ups.svg';
                    if (e.target.src !== window.location.origin + fallback) {
                      e.target.src = fallback;
                    }
                  }}
                />
              );
            }

            return (
              <>
                <div style={{ fontSize: 64, marginBottom: 8 }}>🧘‍♂️🦵</div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary-indigo)' }}>
                  {exerciseTitle} Visual Guide
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Controlled cadence &bull; Proper clinical alignment
                </span>
              </>
            );
          })()}
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
              {sets}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Repetitions</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {reps}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Est. Duration</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {durationText}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            Overview
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {exercise.description}
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            Instructions:
          </h3>
          {instructions.length > 0 ? (
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
              {instructions.map((step, idx) => (
                <li key={idx}>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Follow your clinical therapist&apos;s pacing guidance.
            </p>
          )}
        </div>

        {/* Safety Instructions */}
        {exercise.safetyInstructions && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <strong style={{ fontSize: 14, color: 'var(--color-danger, #EF4444)' }}>
                Safety &amp; Precautions
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {exercise.safetyInstructions}
            </p>
          </div>
        )}

        {/* Action Buttons: Guided Mode & Camera Mode Beta */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {getExerciseCameraConfig(exercise).isSupported ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate(`/patient/exercises/${exercise.id || exercise._id}/guided`, { state: { mode: 'guided' } })}
                className="btn btn-outline btn-lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span>🧭</span>
                <span>Guided Pacing</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/patient/exercises/${exercise.id || exercise._id}/guided`, { state: { mode: 'camera' } })}
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span>📷</span>
                <span>Camera Mode (Beta)</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/patient/exercises/${exercise.id || exercise._id}/guided`)}
              className="btn btn-primary btn-block btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <span>🧭</span>
              <span>Start Guided Mode &rarr;</span>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
