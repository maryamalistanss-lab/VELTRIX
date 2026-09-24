import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { exerciseCatalog } from '../../data/exerciseMockData';
import { ROUTES } from '../../utils/constants';

/**
 * TherapistExercises Component
 * Replicates Screen 4 of Therapist App in Image 1 & 2 (Exercise Management).
 */
export default function TherapistExercises() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    return exerciseCatalog.filter((ex) => {
      const matchSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPart = selectedBodyPart === 'ALL' || ex.bodyPart === selectedBodyPart;
      return matchSearch && matchPart;
    });
  }, [searchTerm, selectedBodyPart]);

  const bodyParts = ['ALL', 'Shoulders', 'Knees', 'Chest', 'Legs', 'Neck'];

  return (
    <div className="page-container therapist-exercises-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Exercises</h1>
          <p className="page-subtitle">
            Clinical exercise repository &bull; Prescription templates and motion protocols
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsAddExerciseModalOpen(true)}
            className="btn btn-primary"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      <Card>
        {/* Search & Body Part Filter Bar */}
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
          <div className="topbar-search-wrapper" style={{ width: 320 }}>
            <span className="topbar-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="topbar-search-input"
            />
          </div>

          {/* Body Part Dropdown */}
          <div style={{ minWidth: 180 }}>
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="form-select"
            >
              {bodyParts.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Body Parts' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercises Management Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Body Part</th>
                <th>Difficulty</th>
                <th>Sets</th>
                <th>Reps</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex) => (
                <tr key={ex.id}>
                  {/* Exercise Title with Icon */}
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
                        }}
                      >
                        🏃‍♂️
                      </div>
                      <Link
                        to={`/therapist/exercises/${ex.id}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {ex.title}
                      </Link>
                    </div>
                  </td>

                  <td>{ex.bodyPart}</td>

                  <td>
                    <Badge variant={ex.difficulty === 'Beginner' ? 'mint' : 'warning'}>
                      {ex.difficulty}
                    </Badge>
                  </td>

                  <td style={{ fontWeight: 600 }}>{ex.sets}</td>
                  <td>{ex.reps}</td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Link
                        to={`/therapist/exercises/${ex.id}`}
                        className="btn btn-outline btn-sm"
                        title="View Protocol"
                      >
                        Preview
                      </Link>
                      <Link
                        to={ROUTES.THERAPIST.ASSIGN}
                        className="btn btn-primary btn-sm"
                        title="Prescribe to Patient"
                      >
                        Prescribe
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            marginTop: 8,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          <span>Showing 1 to {filteredExercises.length} of 18 exercises</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3].map((page) => (
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
          </div>
        </div>
      </Card>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        title="Add New Clinical Exercise"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddExerciseModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddExerciseModalOpen(false)}
            >
              Save Exercise
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Exercise Name:</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Quad Sets"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Body Region / Joint:</label>
          <select className="form-select">
            <option value="Knees">Knees</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Spine">Spine</option>
            <option value="Chest">Chest</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
