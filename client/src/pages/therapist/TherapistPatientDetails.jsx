import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import patientService from '../../services/patientService';
import sessionService from '../../services/sessionService';
import exerciseService from '../../services/exerciseService';
import { ROUTES } from '../../utils/constants';

export default function TherapistPatientDetails() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatientData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [exRes, sessRes, ptRes] = await Promise.allSettled([
        exerciseService.getExercises(),
        sessionService.getPatientSessions(patientId).catch(() => sessionService.getSessions()),
        patientService.getPatientById(patientId),
      ]);

      if (exRes.status === 'fulfilled' && exRes.value?.data) {
        setExercises(Array.isArray(exRes.value.data) ? exRes.value.data : []);
      }

      if (sessRes.status === 'fulfilled' && sessRes.value?.data) {
        const allSessions = Array.isArray(sessRes.value.data) ? sessRes.value.data : [];
        setSessions(allSessions.filter((s) => String(s.patientId) === String(patientId)));
      }

      if (ptRes.status === 'fulfilled' && ptRes.value?.data) {
        setPatient(ptRes.value.data);
      } else {
        setPatient({
          id: patientId,
          name: `Patient (${String(patientId).substring(0, 8)}...)`,
          email: `patient-${String(patientId).substring(0, 6)}@veltrix.app`,
          assignedExercises: [],
          therapistNotes: [],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient clinical dossier.');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!patientId) return;
      try {
        const [exRes, sessRes, ptRes] = await Promise.allSettled([
          exerciseService.getExercises(),
          sessionService.getPatientSessions(patientId).catch(() => sessionService.getSessions()),
          patientService.getPatientById(patientId),
        ]);

        if (isMounted) {
          if (exRes.status === 'fulfilled' && exRes.value?.data) {
            setExercises(Array.isArray(exRes.value.data) ? exRes.value.data : []);
          }

          if (sessRes.status === 'fulfilled' && sessRes.value?.data) {
            const allSessions = Array.isArray(sessRes.value.data) ? sessRes.value.data : [];
            setSessions(allSessions.filter((s) => String(s.patientId) === String(patientId)));
          }

          if (ptRes.status === 'fulfilled' && ptRes.value?.data) {
            setPatient(ptRes.value.data);
          } else {
            setPatient({
              id: patientId,
              name: `Patient (${String(patientId).substring(0, 8)}...)`,
              email: `patient-${String(patientId).substring(0, 6)}@veltrix.app`,
              assignedExercises: [],
              therapistNotes: [],
            });
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load patient clinical dossier.');
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const exerciseMap = useMemo(() => {
    const map = {};
    exercises.forEach((ex) => {
      const id = ex.id || ex._id;
      map[id] = ex;
    });
    return map;
  }, [exercises]);

  const patientName = patient?.name || `Patient ${patientId}`;
  const initial = (patientName[0] || 'P').toUpperCase();

  const latestPain = useMemo(() => {
    if (sessions.length === 0) return '—';
    const sorted = [...sessions].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    return sorted[0]?.painAfter !== undefined ? `${sorted[0].painAfter} / 10` : '—';
  }, [sessions]);

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
        <p style={{ color: 'var(--text-secondary)' }}>Loading patient clinical record...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <div className="breadcrumb-bar" style={{ marginBottom: 16 }}>
        <Link to={ROUTES.THERAPIST.PATIENTS} className="breadcrumb-link">
          &larr; Back to Patient Directory
        </Link>
        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>/</span>
        <span className="breadcrumb-current" style={{ fontWeight: 600 }}>{patientName}</span>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {error}</span>
          <button type="button" onClick={loadPatientData} className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
            Retry
          </button>
        </div>
      )}

      {/* Patient Header Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar avatar-lg">
            <span>{initial}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: 24 }}>
                {patientName}
              </h1>
              <Badge variant="mint">Active Cohort</Badge>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Patient ID: <code>{patientId}</code> &bull; Email: {patient?.email || '—'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to={`/therapist/patients/${patientId}/assign`}
            className="btn btn-primary"
          >
            + Assign Exercise
          </Link>
          <Link
            to={`/therapist/patients/${patientId}/progress`}
            className="btn btn-outline"
          >
            Telemetry & Progress
          </Link>
        </div>
      </div>

      {/* Grid: Overview & Compliance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <Card title="Clinical Summary" subtitle="Patient account and demographic parameters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{patient?.email || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Completed Sessions:</span>
              <strong style={{ color: 'var(--primary-indigo)' }}>{sessions.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Exercise Programs:</span>
              <strong>{patient?.assignedExercises?.length || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Latest Reported Pain:</span>
              <strong style={{ color: 'var(--accent-mint)' }}>{latestPain}</strong>
            </div>
          </div>
        </Card>

        <Card title="Latest Session Snapshot" subtitle="Most recent rehabilitation log">
          {sessions.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0 }}>No sessions logged yet for this patient.</p>
            </div>
          ) : (
            <div>
              {(() => {
                const latest = sessions[0];
                const exName = exerciseMap[latest.exerciseId]?.name || `Exercise (${String(latest.exerciseId).substring(0, 8)}...)`;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Routine:</span>
                      <strong>{exName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                      <span>{new Date(latest.completedAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Volume:</span>
                      <span>{latest.setsCompleted} sets {latest.repsCompleted ? `× ${latest.repsCompleted} reps` : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pain Rating:</span>
                      <strong style={{ color: 'var(--accent-mint)' }}>{latest.painBefore} &rarr; {latest.painAfter} / 10</strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Card>
      </div>

      {/* Active Prescribed Exercises */}
      <Card
        title="Active Prescribed Rehabilitation Plan"
        subtitle={`Prescribed protocols for ${patientName}`}
        headerRight={
          <Link
            to={`/therapist/patients/${patientId}/assign`}
            className="btn btn-primary btn-sm"
          >
            + Assign Exercise
          </Link>
        }
      >
        {Array.isArray(patient?.assignedExercises) && patient.assignedExercises.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Clinical Notes</th>
                </tr>
              </thead>
              <tbody>
                {patient.assignedExercises.map((asg) => {
                  const asgId = asg.id || asg._id;
                  const exInfo = exerciseMap[asg.exerciseId];
                  const exName = exInfo?.name || `Exercise (${String(asg.exerciseId).substring(0, 8)}...)`;

                  return (
                    <tr key={asgId}>
                      <td>
                        <Link
                          to={`/therapist/exercises/${asg.exerciseId}`}
                          style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          {exName}
                        </Link>
                      </td>
                      <td>{asg.targetSets} Sets &times; {asg.targetReps ? `${asg.targetReps} Reps` : `${asg.targetDurationSeconds || ''}s`}</td>
                      <td>{asg.frequency || 'Daily'}</td>
                      <td>
                        <Badge variant={asg.status === 'active' ? 'mint' : 'warning'}>
                          {asg.status || 'Active'}
                        </Badge>
                      </td>
                      <td>{asg.dueDate ? new Date(asg.dueDate).toLocaleDateString() : '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{asg.therapistNotes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 12px 0' }}>No active exercise prescriptions assigned to this patient.</p>
            <Link to={`/therapist/patients/${patientId}/assign`} className="btn btn-primary btn-sm">
              + Prescribe Exercise Routine
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
