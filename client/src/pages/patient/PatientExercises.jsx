import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { exerciseCatalog } from '../../data/exerciseMockData';

/**
 * PatientExercises Component
 * Prescribed exercises and library for patients.
 */
export default function PatientExercises() {
  const [selectedBodyPart, setSelectedBodyPart] = useState('ALL');

  const bodyParts = ['ALL', 'Shoulders', 'Knees', 'Chest', 'Legs', 'Neck'];

  const filteredExercises = exerciseCatalog.filter((ex) => {
    if (selectedBodyPart === 'ALL') return true;
    return ex.bodyPart === selectedBodyPart;
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

      {/* Exercise Cards Grid (matching Image 4 design board Card) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {filteredExercises.map((ex) => (
          <Card key={ex.id} hoverable className="exercise-card">
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
              <Badge variant="primary">{ex.bodyPart}</Badge>
            </div>

            {/* Title & Specs */}
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {ex.title}
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              {ex.sets} sets &bull; {ex.reps} reps &bull; {ex.duration}
            </p>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 18px 0', minHeight: 38 }}>
              {ex.description}
            </p>

            {/* Action */}
            <Link
              to={`/patient/exercises/${ex.id}`}
              className="btn btn-primary btn-block"
            >
              Start Exercise &rarr;
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
