import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import sessionService from '../../services/sessionService';
import exerciseService from '../../services/exerciseService';
import { ROUTES } from '../../utils/constants';

export default function TherapistSessions() {
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSessionsData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [sessRes, exRes] = await Promise.allSettled([
        sessionService.getSessions({ limit: 100 }),
        exerciseService.getExercises(),
      ]);

      if (sessRes.status === 'fulfilled' && sessRes.value?.data) {
        setSessions(Array.isArray(sessRes.value.data) ? sessRes.value.data : []);
      }
      if (exRes.status === 'fulfilled' && exRes.value?.data) {
        setExercises(Array.isArray(exRes.value.data) ? exRes.value.data : []);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to retrieve session logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [sessRes, exRes] = await Promise.allSettled([
          sessionService.getSessions({ limit: 100 }),
          exerciseService.getExercises(),
        ]);

        if (isMounted) {
          if (sessRes.status === 'fulfilled' && sessRes.value?.data) {
            setSessions(Array.isArray(sessRes.value.data) ? sessRes.value.data : []);
          }
          if (exRes.status === 'fulfilled' && exRes.value?.data) {
            setExercises(Array.isArray(exRes.value.data) ? exRes.value.data : []);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.response?.data?.message || 'Failed to retrieve session logs.');
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const exerciseMap = useMemo(() => {
    const map = {};
    exercises.forEach((ex) => {
      const id = ex.id || ex._id;
      map[id] = ex.name;
    });
    return map;
  }, [exercises]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const exName = exerciseMap[s.exerciseId] || '';
      const patientIdStr = String(s.patientId || '');
      const query = searchTerm.toLowerCase();
      return exName.toLowerCase().includes(query) || patientIdStr.toLowerCase().includes(query);
    });
  }, [sessions, exerciseMap, searchTerm]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Clinical Session Telemetry</h1>
          <p className="page-subtitle">
            Comprehensive history of patient rehabilitation exercise sessions logged in MongoDB
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={loadSessionsData} className="btn btn-outline">
            Refresh
          </button>
          <Link to={ROUTES.THERAPIST.ASSIGN} className="btn btn-primary">
            + Assign Exercise
          </Link>
        </div>
      </div>

      {apiError && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error-border)',
            marginBottom: 20,
          }}
        >
          ⚠️ {apiError}
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
              placeholder="Search by exercise or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="topbar-search-input"
              aria-label="Search sessions"
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
            <p style={{ fontWeight: 500 }}>Retrieving live session telemetry from database...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
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
            <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>📋</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No Sessions Found
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 18px auto' }}>
              {searchTerm
                ? 'No sessions matched your search criteria.'
                : 'No exercise sessions have been logged by patients yet in the system.'}
            </p>
          </div>
        ) : (
          /* Sessions Table */
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Exercise</th>
                  <th>Sets / Reps</th>
                  <th>Pain Delta</th>
                  <th>Perceived Effort</th>
                  <th>Feedback</th>
                  <th style={{ textAlign: 'right' }}>Patient Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((sess) => {
                  const sId = sess.id || sess._id;
                  const exName = exerciseMap[sess.exerciseId] || `Exercise (${String(sess.exerciseId).substring(0, 8)}...)`;
                  const dateFormatted = new Date(sess.completedAt).toLocaleString();
                  const painBefore = sess.painBefore ?? '—';
                  const painAfter = sess.painAfter ?? '—';
                  const pId = sess.patientId;

                  return (
                    <tr key={sId}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{dateFormatted}</td>

                      <td>
                        <Link
                          to={`/therapist/patients/${pId}/progress`}
                          style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          Patient {String(pId).substring(0, 8)}...
                        </Link>
                      </td>

                      <td>
                        <Link
                          to={`/therapist/exercises/${sess.exerciseId}`}
                          style={{ color: 'var(--primary-indigo)' }}
                        >
                          {exName}
                        </Link>
                      </td>

                      <td>
                        {sess.setsCompleted} sets {sess.repsCompleted ? `× ${sess.repsCompleted} reps` : sess.durationSeconds ? `(${sess.durationSeconds}s)` : ''}
                      </td>

                      <td>
                        <span style={{ fontWeight: 700 }}>
                          {painBefore} &rarr;{' '}
                          <span
                            style={{
                              color: Number(painAfter) <= 3 ? 'var(--accent-mint)' : Number(painAfter) <= 6 ? 'var(--color-warning)' : 'var(--color-error)',
                            }}
                          >
                            {painAfter} / 10
                          </span>
                        </span>
                      </td>

                      <td>
                        <Badge
                          variant={
                            sess.perceivedDifficulty === 'easy'
                              ? 'mint'
                              : sess.perceivedDifficulty === 'moderate'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {sess.perceivedDifficulty || 'Completed'}
                        </Badge>
                      </td>

                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }}>
                        {sess.sessionResults?.feedback || (sess.sessionResults?.accuracyPercentage ? `${sess.sessionResults.accuracyPercentage}% accuracy` : '—')}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/therapist/patients/${pId}/progress`}
                          className="btn btn-outline btn-sm"
                        >
                          Telemetry &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
