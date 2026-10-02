import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import patientService from '../../services/patientService';
import sessionService from '../../services/sessionService';

export default function TherapistPatients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setIsFallbackMode(false);

    try {
      const response = await patientService.getPatients();
      if (response && response.success && Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        setPatients(response?.data || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsFallbackMode(true);
        try {
          const sessionsRes = await sessionService.getSessions();
          if (sessionsRes && sessionsRes.success && Array.isArray(sessionsRes.data)) {
            const discoveredMap = {};
            sessionsRes.data.forEach((s) => {
              if (s.patientId && !discoveredMap[s.patientId]) {
                discoveredMap[s.patientId] = {
                  id: s.patientId,
                  name: `Patient (${String(s.patientId).substring(0, 8)}...)`,
                  email: `patient-${String(s.patientId).substring(0, 6)}@veltrix.app`,
                  activeAssignmentsCount: 1,
                  totalSessions: 1,
                  lastActive: new Date(s.completedAt).toLocaleDateString(),
                  createdAt: s.createdAt || s.completedAt,
                };
              } else if (s.patientId && discoveredMap[s.patientId]) {
                discoveredMap[s.patientId].totalSessions += 1;
              }
            });
            setPatients(Object.values(discoveredMap));
          } else {
            setPatients([]);
          }
        } catch {
          setPatients([]);
        }
      } else {
        const msg = err.response?.data?.message || 'Failed to retrieve patients from backend.';
        setApiError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const response = await patientService.getPatients();
        if (isMounted) {
          if (response && response.success && Array.isArray(response.data)) {
            setPatients(response.data);
          } else {
            setPatients(response?.data || []);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setIsFallbackMode(true);
            try {
              const sessionsRes = await sessionService.getSessions();
              if (isMounted && sessionsRes && sessionsRes.success && Array.isArray(sessionsRes.data)) {
                const discoveredMap = {};
                sessionsRes.data.forEach((s) => {
                  if (s.patientId && !discoveredMap[s.patientId]) {
                    discoveredMap[s.patientId] = {
                      id: s.patientId,
                      name: `Patient (${String(s.patientId).substring(0, 8)}...)`,
                      email: `patient-${String(s.patientId).substring(0, 6)}@veltrix.app`,
                      activeAssignmentsCount: 1,
                      totalSessions: 1,
                      lastActive: new Date(s.completedAt).toLocaleDateString(),
                      createdAt: s.createdAt || s.completedAt,
                    };
                  } else if (s.patientId && discoveredMap[s.patientId]) {
                    discoveredMap[s.patientId].totalSessions += 1;
                  }
                });
                setPatients(Object.values(discoveredMap));
              }
            } catch {
              // ignore
            }
          } else {
            setApiError(err.response?.data?.message || 'Failed to retrieve patients from backend.');
          }
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = p.name || '';
      const email = p.email || '';
      const query = searchTerm.toLowerCase();
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });
  }, [patients, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  return (
    <div className="page-container therapist-patients-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="page-subtitle">
            Assigned clinical cohort &bull; Patient monitoring, adherence, and rehabilitation telemetry
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/therapist/assign" className="btn btn-primary">
            + Assign Exercise
          </Link>
        </div>
      </div>

      {/* Backend Dependency Banner if endpoint is 404 */}
      {isFallbackMode && (
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
          <strong>Backend Notice:</strong> The dedicated patient directory endpoint (<code>GET /api/users/patients</code>) is pending integration by backend foundation. Active patients shown below are dynamically populated from live MongoDB session logs.
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
          <button type="button" onClick={loadPatients} className="btn btn-outline btn-sm">
            Retry
          </button>
        </div>
      )}

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
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="topbar-search-input"
              aria-label="Search patients"
            />
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
            <p style={{ fontWeight: 500 }}>Retrieving patient records from database...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
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
            <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>👥</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No Patients Found
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 18px auto' }}>
              {searchTerm
                ? 'No patients matched your search query. Try checking the spelling.'
                : 'No registered patients are currently assigned to your clinical care roster.'}
            </p>
            <Link to="/therapist/assign" className="btn btn-primary">
              Prescribe Exercise to Patient
            </Link>
          </div>
        ) : (
          /* Patients Table */
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Active Protocols</th>
                  <th>Registration / Logged Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => {
                  const patientId = patient.id || patient._id;
                  const initial = (patient.name || 'P').charAt(0).toUpperCase();

                  return (
                    <tr key={patientId}>
                      {/* Patient Name with Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">
                            <span>{initial}</span>
                          </div>
                          <div>
                            <Link
                              to={`/therapist/patients/${patientId}/progress`}
                              style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}
                            >
                              {patient.name}
                            </Link>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              ID: {String(patientId).substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)' }}>{patient.email || '—'}</td>

                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}>
                          {patient.activeAssignmentsCount ?? (patient.totalSessions ? `${patient.totalSessions} sessions` : '—')}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text-secondary)' }}>
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <Link
                            to={`/therapist/patients/${patientId}/progress`}
                            className="btn btn-outline btn-sm"
                            title="View patient progress and session telemetry"
                          >
                            Progress
                          </Link>
                          <Link
                            to={`/therapist/patients/${patientId}/assign`}
                            className="btn btn-primary btn-sm"
                            title="Assign exercise to this patient"
                          >
                            Assign
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

        {/* Pagination Bar */}
        {!isLoading && filteredPatients.length > 0 && (
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
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{' '}
              {filteredPatients.length} patients
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
    </div>
  );
}
