import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Modal from '../../components/common/Modal';
import { clinicalPatientDirectory } from '../../data/therapistMockData';

/**
 * TherapistPatients Component
 * Replicates Screen 3 of Therapist App in Image 1 & 2 (Patient List).
 */
export default function TherapistPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientCondition, setNewPatientCondition] = useState('Knee Recovery');

  const patients = clinicalPatientDirectory;

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const match =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [patients, searchTerm]);

  return (
    <div className="page-container therapist-patients-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">
            Assigned clinical cohort &bull; Monitoring and protocol compliance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsAddPatientModalOpen(true)}
            className="btn btn-primary"
          >
            + Add Patient
          </button>
        </div>
      </div>

      <Card>
        {/* Search Bar */}
        <div style={{ marginBottom: 20 }}>
          <div className="topbar-search-wrapper" style={{ width: '100%', maxWidth: 360 }}>
            <span className="topbar-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="topbar-search-input"
            />
          </div>
        </div>

        {/* Patients Table matching Image 1 & 2 Screen 3 */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Condition</th>
                <th>Completion</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  {/* Patient Name with Avatar */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">
                        <span>{patient.name[0]}</span>
                      </div>
                      <Link
                        to={`/therapist/patients/${patient.id}/progress`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {patient.name}
                      </Link>
                    </div>
                  </td>

                  <td>{patient.age}</td>
                  <td>{patient.condition}</td>

                  {/* Completion with bar */}
                  <td style={{ minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-track" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill progress-bar-fill-mint"
                          style={{ width: `${patient.completionRate}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {patient.completionRate}%
                      </span>
                    </div>
                  </td>

                  <td style={{ color: 'var(--text-secondary)' }}>{patient.lastActive}</td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <Link
                        to={`/therapist/patients/${patient.id}/progress`}
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/therapist/patients/${patient.id}/assign`}
                        className="btn btn-primary btn-sm"
                      >
                        Assign
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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
          <span>Showing 1 to {filteredPatients.length} of 12 patients</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`btn btn-sm ${currentPage === 1 ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: 32 }}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`btn btn-sm ${currentPage === 2 ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: 32 }}
            >
              2
            </button>
          </div>
        </div>
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        title="Add New Rehabilitation Patient"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddPatientModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIsAddPatientModalOpen(false);
              }}
            >
              Add Patient
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name:</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Maya Lin"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Condition / Primary Joint:</label>
          <select
            className="form-select"
            value={newPatientCondition}
            onChange={(e) => setNewPatientCondition(e.target.value)}
          >
            <option value="Knee Recovery">Knee Recovery</option>
            <option value="Shoulder Pain">Shoulder Pain</option>
            <option value="Post-Op ACL">Post-Op ACL</option>
            <option value="Lumbar Spine">Lumbar Spine</option>
            <option value="Cervical Spine">Cervical Spine</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
