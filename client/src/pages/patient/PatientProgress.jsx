import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import CircularProgress from '../../components/common/CircularProgress';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';

/**
 * PatientProgress Component
 * Real patient progress tracking and session history using authenticated patient session logs.
 */
export default function PatientProgress() {
  const [sessions, setSessions] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
  const [totalCatalogCount, setTotalCatalogCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | exercises | pain | history

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionsRes, exercisesRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/exercises').catch(() => ({ data: { data: [] } })),
      ]);

      const sessionList = (sessionsRes.data && sessionsRes.data.success && Array.isArray(sessionsRes.data.data))
        ? sessionsRes.data.data
        : [];

      const exerciseList = (exercisesRes.data && exercisesRes.data.success && Array.isArray(exercisesRes.data.data))
        ? exercisesRes.data.data
        : [];

      const exMap = {};
      exerciseList.forEach((ex) => {
        const id = ex.id || ex._id;
        if (id) {
          exMap[id] = ex;
        }
      });

      setSessions(sessionList);
      setExercisesMap(exMap);
      setTotalCatalogCount(exerciseList.length || 9);
    } catch (err) {
      console.error('Failed to load patient progress:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load your progress records. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialProgress() {
      try {
        const [sessionsRes, exercisesRes] = await Promise.all([
          api.get('/sessions'),
          api.get('/exercises').catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          const sessionList = (sessionsRes.data && sessionsRes.data.success && Array.isArray(sessionsRes.data.data))
            ? sessionsRes.data.data
            : [];

          const exerciseList = (exercisesRes.data && exercisesRes.data.success && Array.isArray(exercisesRes.data.data))
            ? exercisesRes.data.data
            : [];

          const exMap = {};
          exerciseList.forEach((ex) => {
            const id = ex.id || ex._id;
            if (id) {
              exMap[id] = ex;
            }
          });

          setSessions(sessionList);
          setExercisesMap(exMap);
          setTotalCatalogCount(exerciseList.length || 9);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load patient progress:', err);
          setError(
            err.response?.data?.message ||
            'Unable to load your progress records. Please check your connection and try again.'
          );
          setIsLoading(false);
        }
      }
    }

    loadInitialProgress();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derived statistics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const uniqueExerciseIds = new Set(sessions.map((s) => String(s.exerciseId))).size;
    const completionPercentage = totalCatalogCount > 0
      ? Math.min(100, Math.round((uniqueExerciseIds / totalCatalogCount) * 100))
      : 0;

    const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 180), 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    // Calculate pain reduction
    let totalReduction = 0;
    let validPairs = 0;
    sessions.forEach((s) => {
      if (s.painBefore !== undefined && s.painAfter !== undefined) {
        totalReduction += (s.painBefore - s.painAfter);
        validPairs += 1;
      }
    });
    const avgPainReduction = validPairs > 0 ? (totalReduction / validPairs).toFixed(1) : '0.0';

    // Consecutive activity days / streak estimate
    const sessionDays = new Set(
      sessions.map((s) => new Date(s.completedAt).toISOString().split('T')[0])
    );
    const streakDays = sessionDays.size;

    return {
      totalSessions,
      uniqueExerciseIds,
      completionPercentage,
      totalMinutes,
      avgPainReduction,
      streakDays,
    };
  }, [sessions, totalCatalogCount]);

  // Chronological pain data for SimpleLineChart (0-10 scale)
  const painTrendData = useMemo(() => {
    if (sessions.length === 0) return [];

    // Take last 8 sessions chronologically (oldest to newest)
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const recent = sorted.slice(-8);

    return recent.map((s, idx) => {
      const d = new Date(s.completedAt);
      const dateLabel = d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
      return {
        sessionIndex: dateLabel || `S${idx + 1}`,
        pain: s.painAfter !== undefined ? s.painAfter : s.painBefore,
        painBefore: s.painBefore,
        painAfter: s.painAfter,
      };
    });
  }, [sessions]);

  // Helper to format exercise name
  const getExerciseName = (exerciseId) => {
    if (!exerciseId) return 'Rehabilitation Exercise';
    const match = exercisesMap[exerciseId];
    if (match) return match.name || match.title;
    if (typeof exerciseId === 'object' && exerciseId.name) return exerciseId.name;
    return `Exercise (${String(exerciseId).slice(-6)})`;
  };

  return (
    <div className="page-container patient-progress-page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">My Progress</h1>
          <p className="page-subtitle">
            Longitudinal rehabilitation tracking, completion consistency, and pain trends.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 12,
          marginBottom: 24,
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'exercises', label: 'Exercises' },
          { id: 'pain', label: 'Pain Trend' },
          { id: 'history', label: 'History' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your progress history...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card style={{ textAlign: 'center', padding: '40px 20px', borderColor: 'var(--color-danger, #EF4444)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Unable to Load Progress</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</p>
          <button type="button" onClick={fetchData} className="btn btn-primary">
            Retry
          </button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && sessions.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
            No Exercise Sessions Recorded Yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
            You haven&apos;t completed any guided rehabilitation sessions yet. Once you complete your first exercise, your progress charts, session history, and pain trajectory will appear here.
          </p>
          <Link to={ROUTES.PATIENT.EXERCISES} className="btn btn-primary btn-lg">
            Start Your First Exercise &rarr;
          </Link>
        </Card>
      )}

      {/* Populated State */}
      {!isLoading && !error && sessions.length > 0 && (
        <>
          {/* Top KPI Metric Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {/* Exercise Completion Ring */}
            <div className="kpi-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="kpi-label">Exercise Completion</span>
                <div className="kpi-value">{metrics.completionPercentage}%</div>
                <p className="kpi-subtext">
                  {metrics.uniqueExerciseIds} of {totalCatalogCount} protocols
                </p>
              </div>
              <CircularProgress
                value={metrics.completionPercentage}
                size={60}
                strokeWidth={6}
                color="#10B981"
              />
            </div>

            {/* Total Completed Sessions */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Completed Sessions</span>
                <span style={{ fontSize: 18 }}>📅</span>
              </div>
              <div className="kpi-value">{metrics.totalSessions}</div>
              <p className="kpi-subtext">Total verified logs</p>
            </div>

            {/* Total Minutes Active */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Minutes</span>
                <span style={{ fontSize: 18 }}>⏱️</span>
              </div>
              <div className="kpi-value">{metrics.totalMinutes} min</div>
              <p className="kpi-subtext">Rehab engagement time</p>
            </div>

            {/* Active Days / Streak */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Active Days</span>
                <span style={{ fontSize: 18 }}>🔥</span>
              </div>
              <div className="kpi-value">{metrics.streakDays} Days</div>
              <p className="kpi-subtext">Clinical consistency</p>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Pain Trend Card */}
              <Card
                title="Pain Trend Over Time (0–10 VAS Scale)"
                subtitle="Patient-reported post-exercise pain scores across completed sessions"
              >
                {painTrendData.length > 0 ? (
                  <SimpleLineChart
                    data={painTrendData}
                    xKey="sessionIndex"
                    yKey="pain"
                    height={190}
                    strokeColor="#6366F1"
                    yMin={0}
                    yMax={10}
                  />
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    Insufficient telemetry to render line trajectory.
                  </p>
                )}
              </Card>

              {/* Recent Sessions Table */}
              <Card
                title="Recent Exercise Sessions"
                subtitle="Latest recorded rehabilitation logs"
                headerRight={
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    View All &rarr;
                  </button>
                }
              >
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Exercise</th>
                        <th>Volume</th>
                        <th>Pain (&Delta;)</th>
                        <th>Difficulty</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 5).map((s) => {
                        const dateStr = new Date(s.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        });
                        const delta = s.painAfter - s.painBefore;

                        return (
                          <tr key={s.id || s._id}>
                            <td style={{ fontWeight: 600 }}>{dateStr}</td>
                            <td>{getExerciseName(s.exerciseId)}</td>
                            <td>
                              {s.setsCompleted} sets &bull; {s.repsCompleted || 10} reps
                            </td>
                            <td>
                              {s.painBefore} &rarr;{' '}
                              <strong style={{ color: delta <= 0 ? 'var(--accent-mint)' : 'var(--color-danger, #EF4444)' }}>
                                {s.painAfter}/10
                              </strong>
                            </td>
                            <td>
                              <span style={{ textTransform: 'capitalize' }}>
                                {s.perceivedDifficulty}
                              </span>
                            </td>
                            <td>
                              <Badge variant="success">Completed</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: EXERCISES */}
          {activeTab === 'exercises' && (
            <Card
              title="Exercise Protocol Breakdown"
              subtitle="Breakdown of exercises completed in your rehabilitation program"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                  paddingTop: 8,
                }}
              >
                {Array.from(new Set(sessions.map((s) => String(s.exerciseId)))).map((exId) => {
                  const count = sessions.filter((s) => String(s.exerciseId) === exId).length;
                  const name = getExerciseName(exId);
                  const exDetails = exercisesMap[exId];

                  return (
                    <div
                      key={exId}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {name}
                        </h4>
                        <Badge variant="primary">{count} {count === 1 ? 'session' : 'sessions'}</Badge>
                      </div>
                      <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {exDetails?.targetBodyPart || 'Rehabilitation Focus'} &bull; {exDetails?.difficulty || 'Standard'}
                      </p>
                      <Link
                        to={`/patient/exercises/${exId}`}
                        className="btn btn-outline btn-sm btn-block"
                      >
                        Repeat Exercise &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 3: PAIN TREND */}
          {activeTab === 'pain' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card
                title="Pain Trajectory (0–10 Visual Analog Scale)"
                subtitle="Progression of pain scores before vs after exercise"
              >
                <SimpleLineChart
                  data={painTrendData}
                  xKey="sessionIndex"
                  yKey="pain"
                  height={220}
                  strokeColor="#6366F1"
                  yMin={0}
                  yMax={10}
                />
              </Card>

              {/* Pain Analytics Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <div className="kpi-card">
                  <span className="kpi-label">Avg. Pain Reduction</span>
                  <div className="kpi-value" style={{ color: 'var(--accent-mint)' }}>
                    -{metrics.avgPainReduction} pts
                  </div>
                  <p className="kpi-subtext">Post-session relief</p>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">Latest Pain Reported</span>
                  <div className="kpi-value">
                    {sessions[0]?.painAfter !== undefined ? `${sessions[0].painAfter} / 10` : '-'}
                  </div>
                  <p className="kpi-subtext">Most recent session</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLETE HISTORY */}
          {activeTab === 'history' && (
            <Card
              title="Full Session History Log"
              subtitle="All verified rehabilitation sessions recorded in MongoDB"
            >
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Exercise</th>
                      <th>Sets / Reps</th>
                      <th>Duration</th>
                      <th>Pain Before</th>
                      <th>Pain After</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => {
                      const dateStr = new Date(s.completedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      const m = Math.floor((s.durationSeconds || 180) / 60);
                      const sec = (s.durationSeconds || 180) % 60;
                      const durationStr = `${m}m ${sec}s`;

                      return (
                        <tr key={s.id || s._id}>
                          <td style={{ fontWeight: 600 }}>{dateStr}</td>
                          <td>{getExerciseName(s.exerciseId)}</td>
                          <td>
                            {s.setsCompleted} &times; {s.repsCompleted || 10}
                          </td>
                          <td>{durationStr}</td>
                          <td>{s.painBefore} / 10</td>
                          <td>
                            <strong style={{ color: s.painAfter <= s.painBefore ? 'var(--accent-mint)' : 'var(--color-danger, #EF4444)' }}>
                              {s.painAfter} / 10
                            </strong>
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize' }}>
                              {s.perceivedDifficulty}
                            </span>
                          </td>
                          <td>
                            <Badge variant="success">Completed</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
