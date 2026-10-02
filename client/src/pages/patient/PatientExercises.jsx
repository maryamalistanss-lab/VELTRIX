import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

/**
 * PatientExercises Component
 * Prescribed exercises and library for patients using real MongoDB catalog.
 */
export default function PatientExercises() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState('ALL');

  const bodyParts = ['ALL', 'Shoulders', 'Knees', 'Chest', 'Legs', 'Neck'];

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/exercises');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setExercises(response.data.data);
      } else {
        setExercises([]);
      }
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load exercises. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialExercises() {
      try {
        const response = await api.get('/exercises');
        if (isMounted) {
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setExercises(response.data.data);
          } else {
            setExercises([]);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch exercises:', err);
          setError(
            err.response?.data?.message ||
            'Unable to load exercises. Please check your network connection.'
          );
          setIsLoading(false);
        }
      }
    }

    loadInitialExercises();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredExercises = exercises.filter((ex) => {
    if (selectedBodyPart === 'ALL') return true;
    const part = (ex.targetBodyPart || ex.bodyPart || '').toLowerCase();
    return part === selectedBodyPart.toLowerCase();
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescribed Exercises</h1>
          <p className="page-subtitle">
            Your personalized rehabilitation protocols prescribed by your clinical care team.
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {bodyParts.map((part) => (
          <button
            type="button"
            key={part}
            onClick={() => setSelectedBodyPart(part)}
            className={`btn btn-sm ${selectedBodyPart === part ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {part === 'ALL' ? 'All Exercises' : part}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading exercise catalog...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--color-danger, #EF4444)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Failed to Load Exercises</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</p>
          <button type="button" onClick={fetchExercises} className="btn btn-primary">
            Retry Loading
          </button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredExercises.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No Exercises Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            {selectedBodyPart === 'ALL'
              ? 'No exercises are currently available in the master catalog.'
              : `No exercises found targeting ${selectedBodyPart}.`}
          </p>
          {selectedBodyPart !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedBodyPart('ALL')}
              className="btn btn-outline"
            >
              Show All Exercises
            </button>
          )}
        </Card>
      )}

      {/* Exercise Cards Grid */}
      {!isLoading && !error && filteredExercises.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {filteredExercises.map((ex) => {
            const exerciseTitle = ex.name || ex.title;
            const targetArea = ex.targetBodyPart || ex.bodyPart || 'Rehab';
            const sets = ex.defaultSets || ex.sets || 3;
            const reps = ex.defaultReps || ex.reps || 10;
            const duration = ex.defaultDurationSeconds
              ? `${Math.round(ex.defaultDurationSeconds / 60)} mins`
              : (ex.duration || '5 mins');
            const difficulty = ex.difficulty || 'beginner';

            return (
              <Card key={ex.id || ex._id} hoverable className="exercise-card">
                {/* Header: Icon + Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-indigo)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    🏃‍♂️
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge variant="primary">{targetArea}</Badge>
                    <Badge variant="mint">{difficulty}</Badge>
                  </div>
                </div>

                {/* Title & Specs */}
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {exerciseTitle}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {sets} sets &bull; {reps} reps &bull; {duration}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: '0 0 18px 0',
                    minHeight: 38,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {ex.description}
                </p>

                {/* Action */}
                <Link
                  to={`/patient/exercises/${ex.id || ex._id}`}
                  className="btn btn-primary btn-block"
                >
                  Start Exercise &rarr;
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
