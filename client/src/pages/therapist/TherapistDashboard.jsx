import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatCard from '../../components/common/StatCard';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import { useAuth } from '../../hooks/useAuth';
import exerciseService from '../../services/exerciseService';
import sessionService from '../../services/sessionService';
import patientService from '../../services/patientService';
import { ROUTES } from '../../utils/constants';

export default function TherapistDashboard() {
  const { user } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const therapistName = user?.name || 'Clinical Therapist';

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const [exercisesRes, sessionsRes, patientsRes] = await Promise.allSettled([
        exerciseService.getExercises(),
        sessionService.getSessions({ limit: 50 }),
        patientService.getPatients(),
      ]);

      if (exercisesRes.status === 'fulfilled' && exercisesRes.value?.data) {
        setExercises(Array.isArray(exercisesRes.value.data) ? exercisesRes.value.data : []);
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setSessions(Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : []);
      }

      if (patientsRes.status === 'fulfilled' && patientsRes.value?.data) {
        setPatients(Array.isArray(patientsRes.value.data) ? patientsRes.value.data : []);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to sync clinical dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [exercisesRes, sessionsRes, patientsRes] = await Promise.allSettled([
          exerciseService.getExercises(),
          sessionService.getSessions({ limit: 50 }),
          patientService.getPatients(),
        ]);

        if (isMounted) {
          if (exercisesRes.status === 'fulfilled' && exercisesRes.value?.data) {
            setExercises(Array.isArray(exercisesRes.value.data) ? exercisesRes.value.data : []);
          }
          if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
            setSessions(Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : []);
          }
          if (patientsRes.status === 'fulfilled' && patientsRes.value?.data) {
            setPatients(Array.isArray(patientsRes.value.data) ? patientsRes.value.data : []);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.response?.data?.message || 'Failed to sync clinical dashboard metrics.');
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map of exercise ID to Exercise Name
  const exerciseMap = useMemo(() => {
    const map = {};
    exercises.forEach((ex) => {
      const id = ex.id || ex._id;
      map[id] = ex.name;
    });
    return map;
  }, [exercises]);

  // Unique managed patients count
  const totalPatientCount = useMemo(() => {
    if (patients.length > 0) return patients.length;
    const uniqueIds = new Set(sessions.map((s) => s.patientId).filter(Boolean));
    return uniqueIds.size;
  }, [patients, sessions]);

  // Sessions in the last 7 days
  const sessionsThisWeek = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return sessions.filter((s) => new Date(s.completedAt) >= sevenDaysAgo).length;
  }, [sessions]);

  // Pain reduction calculation from real sessions
  const painReductionStats = useMemo(() => {
    const valid = sessions.filter((s) => typeof s.painBefore === 'number' && typeof s.painAfter === 'number');
    if (valid.length === 0) return { avgDelta: 0, text: 'No pain telemetry' };
    const totalDelta = valid.reduce((acc, s) => acc + (s.painBefore - s.painAfter), 0);
    const avg = totalDelta / valid.length;
    return {
      avgDelta: avg.toFixed(1),
      text: avg >= 0 ? `-${avg.toFixed(1)} avg pain drop` : `+${Math.abs(avg).toFixed(1)} pain increase`,
    };
  }, [sessions]);

  // Weekly Sessions Overview Chart Data (last 7 days grouped by day)
  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      const count = sessions.filter((s) => {
        const sDate = new Date(s.completedAt).toISOString().split('T')[0];
        return sDate === dateStr;
      }).length;

      result.push({
        day: dayLabel,
        sessions: count,
      });
    }
    return result;
  }, [sessions]);

  // Real Clinical Alerts (sessions where painAfter >= 6 or pain increased significantly)
  const clinicalAlerts = useMemo(() => {
    const alerts = [];
    sessions.forEach((s) => {
      const exName = exerciseMap[s.exerciseId] || 'Rehabilitation Routine';
      const sDate = new Date(s.completedAt).toLocaleDateString();

      if (s.painAfter >= 7) {
        alerts.push({
          id: s.id || s._id,
          type: 'warning',
          title: 'High Post-Session Pain Reported',
          message: `Patient reported ${s.painAfter}/10 pain after ${exName} on ${sDate}.`,
          patientId: s.patientId,
        });
      } else if (s.painAfter - s.painBefore >= 3) {
        alerts.push({
          id: s.id || s._id,
          type: 'warning',
          title: 'Elevated Pain Spike',
          message: `Pain increased from ${s.painBefore} to ${s.painAfter} during ${exName}.`,
          patientId: s.patientId,
        });
      }
    });
    return alerts.slice(0, 4);
  }, [sessions, exerciseMap]);

  return (
    <div className="page-container therapist-dashboard-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Clinical Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {therapistName} &bull; Live clinical telemetry and rehabilitation command center
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={ROUTES.THERAPIST.ASSIGN} className="btn btn-primary">
            + Assign Exercise
          </Link>
          <Link to={ROUTES.THERAPIST.EXERCISES} className="btn btn-outline">
            Exercise Catalog
          </Link>
        </div>
      </div>

      {apiError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning-border)',
            marginBottom: 20,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>ℹ️ {apiError}</span>
          <button type="button" onClick={loadDashboardData} className="btn btn-ghost btn-sm">
            Refresh
          </button>
        </div>
      )}

      {/* 4 KPI Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Managed Patients"
          value={isLoading ? '...' : totalPatientCount}
          delta={totalPatientCount > 0 ? 'Active Cohort' : 'Awaiting sync'}
          isPositive={true}
          icon={<span>👥</span>}
        />
        <StatCard
          label="Active Exercises"
          value={isLoading ? '...' : exercises.length}
          delta="In Database"
          isPositive={true}
          icon={<span>🏋️</span>}
        />
        <StatCard
          label="Sessions This Week"
          value={isLoading ? '...' : sessionsThisWeek}
          delta={sessions.length > 0 ? `${sessions.length} all-time` : '0 logged'}
          isPositive={sessionsThisWeek > 0}
          icon={<span>📈</span>}
        />
        <StatCard
          label="Pain Trajectory"
          value={isLoading ? '...' : painReductionStats.text}
          delta="Average delta"
          isPositive={Number(painReductionStats.avgDelta) >= 0}
          icon={<span>🎯</span>}
        />
      </div>

      {/* Main Grid: Left Column (Recent Activity & Sessions Chart) + Right Column (Alerts & Exercises) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 24,
        }}
        className="dashboard-columns-grid"
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Live Activity */}
          <Card
            title="Recent Activity"
            subtitle="Live patient telemetry and exercise session completions"
            headerRight={
              <Link
                to={ROUTES.THERAPIST.SESSIONS}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)' }}
              >
                View All Activity &rarr;
              </Link>
            }
          >
            {isLoading ? (
              <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>Loading live activity stream...</p>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📝</span>
                <p style={{ margin: 0, fontWeight: 500 }}>No patient exercise sessions logged yet.</p>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  When patients complete rehabilitation routines, their telemetry will stream here in real-time.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.slice(0, 5).map((s) => {
                  const sId = s.id || s._id;
                  const exName = exerciseMap[s.exerciseId] || 'Rehabilitation Routine';
                  const dateFormatted = new Date(s.completedAt).toLocaleString();

                  return (
                    <div
                      key={sId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-elevated)',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-success-bg)',
                            color: 'var(--accent-mint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </div>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {exName}
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {s.setsCompleted} sets {s.repsCompleted ? `&bull; ${s.repsCompleted} reps` : ''} &bull; Pain: {s.painBefore} &rarr; {s.painAfter}/10 ({s.perceivedDifficulty || 'completed'})
                          </p>
                        </div>
                      </div>

                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {dateFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Sessions Overview (Weekly Trajectory) */}
          <Card
            title="Sessions Overview (This Week)"
            subtitle="Daily completed rehabilitation routines across all patients"
          >
            {isLoading ? (
              <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>Loading activity chart...</p>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0 }}>Chart will activate once patients complete exercises.</p>
              </div>
            ) : (
              <SimpleLineChart
                data={weeklyChartData}
                xKey="day"
                yKey="sessions"
                height={160}
                strokeColor="#6366F1"
                yMin={0}
                yMax={Math.max(5, ...weeklyChartData.map((d) => d.sessions) + 2)}
              />
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Clinical Alerts */}
          <Card
            title="Clinical Attention Alerts"
            subtitle="Real-time patient pain spikes and high-score flags"
          >
            {clinicalAlerts.length === 0 ? (
              <div
                style={{
                  padding: '20px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success-bg)',
                  color: 'var(--accent-mint)',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span>✓</span>
                <span>No high-pain flags or critical clinical anomalies detected.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {clinicalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-warning-border)',
                      background: 'var(--color-warning-bg)',
                    }}
                  >
                    <span style={{ fontSize: 18, marginTop: 2 }}>⚠️</span>
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block' }}>
                        {alert.title}
                      </strong>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {alert.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions & Protocol Directory */}
          <Card
            title="Exercise Repository Quick View"
            subtitle={`${exercises.length} available rehabilitation protocols`}
            headerRight={
              <Link
                to={ROUTES.THERAPIST.EXERCISES}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)' }}
              >
                Manage &rarr;
              </Link>
            }
          >
            {exercises.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No exercises in database.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exercises.slice(0, 5).map((ex) => {
                  const exId = ex.id || ex._id;
                  return (
                    <div
                      key={exId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13,
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <Link
                        to={`/therapist/exercises/${exId}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {ex.name}
                      </Link>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {ex.targetBodyPart}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
