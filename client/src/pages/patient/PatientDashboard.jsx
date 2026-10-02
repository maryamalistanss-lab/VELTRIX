import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import CircularProgress from '../../components/common/CircularProgress';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';

/**
 * PatientDashboard Component
 * Renders patient dashboard using authenticated user identity, real MongoDB exercises, and real logged sessions.
 */
export default function PatientDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const [sessionsRes, exercisesRes] = await Promise.all([
          api.get('/sessions').catch(() => ({ data: { data: [] } })),
          api.get('/exercises').catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          const sessionList = (sessionsRes.data && sessionsRes.data.success && Array.isArray(sessionsRes.data.data))
            ? sessionsRes.data.data
            : [];

          const exerciseList = (exercisesRes.data && exercisesRes.data.success && Array.isArray(exercisesRes.data.data))
            ? exercisesRes.data.data
            : [];

          setSessions(sessionList);
          setExercises(exerciseList);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching patient dashboard data:', err);
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const preferredName = user?.name ? user.name.split(' ')[0] : 'Patient';

  // Real metrics calculated from MongoDB sessions and catalog
  const {
    completionRate,
    completedCount,
    totalCount,
    streakDays,
    weeklyCompliance,
    totalMinutesThisWeek,
    painTrendData,
    nextExercise,
  } = useMemo(() => {
    const totalCount = exercises.length || 0;
    const completedExerciseIds = new Set(sessions.map((s) => String(s.exerciseId)));
    const completedCount = completedExerciseIds.size;
    const completionRate = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

    // Active days / streak
    const sessionDays = new Set(
      sessions.map((s) => new Date(s.completedAt).toISOString().split('T')[0])
    );
    const streakDays = sessionDays.size;

    // Active minutes this week
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter((s) => new Date(s.completedAt) >= sevenDaysAgo);
    const weekSeconds = weekSessions.reduce((acc, s) => acc + (s.durationSeconds || 180), 0);
    const totalMinutesThisWeek = Math.round(weekSeconds / 60);

    const weeklyCompliance = weekSessions.length > 0 ? Math.min(100, Math.round((weekSessions.length / 5) * 100)) : 0;

    // Pain trend from real sessions
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const painTrendData = sorted.slice(-7).map((s, idx) => {
      const d = new Date(s.completedAt);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      return {
        day: dayName || `S${idx + 1}`,
        pain: s.painAfter !== undefined ? s.painAfter : s.painBefore,
      };
    });

    // Next exercise to highlight
    const uncompletedEx = exercises.find((ex) => !completedExerciseIds.has(String(ex.id || ex._id)));
    const nextExercise = uncompletedEx || exercises[0] || null;

    return {
      completionRate,
      completedCount,
      totalCount,
      streakDays,
      weeklyCompliance,
      totalMinutesThisWeek,
      painTrendData,
      nextExercise,
    };
  }, [exercises, sessions]);

  return (
    <div className="page-container patient-dashboard-page">
      {/* Welcome Greeting Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Hello, {preferredName} 🖐</h1>
          <p className="page-subtitle">
            Let&apos;s complete your exercises for today. Small steps lead to big changes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            to={ROUTES.PATIENT.EXERCISES}
            className="btn btn-primary"
          >
            Start Today&apos;s Session &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Today's Progress Card with Progress Ring */}
        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="kpi-label">Protocol Progress</span>
            <div className="kpi-value">{completionRate}%</div>
            <p className="kpi-subtext">
              {completedCount} of {totalCount} completed
            </p>
          </div>
          <CircularProgress
            value={completionRate}
            size={56}
            strokeWidth={5}
            color="#10B981"
          />
        </div>

        {/* Streak Card */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Streak</span>
            <span style={{ fontSize: 18 }}>🔥</span>
          </div>
          <div className="kpi-value">{streakDays} Days</div>
          <p className="kpi-subtext">Clinical consistency</p>
        </div>

        {/* This Week Compliance */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">This Week</span>
            <span className="kpi-delta kpi-delta-positive">{weeklyCompliance > 0 ? `↑ ${weeklyCompliance}%` : 'Starting'}</span>
          </div>
          <div className="kpi-value">{weeklyCompliance}%</div>
          <p className="kpi-subtext">Protocol adherence</p>
        </div>

        {/* Total Minutes */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Minutes</span>
            <span style={{ fontSize: 18 }}>⏱️</span>
          </div>
          <div className="kpi-value">{totalMinutesThisWeek} min</div>
          <p className="kpi-subtext">Active this week</p>
        </div>
      </div>

      {/* Main Grid: Today's Exercises + Pain Trend & Therapist Note */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 24,
        }}
        className="dashboard-columns-grid"
      >
        {/* Left Column: Exercises & Pain Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Exercises Card */}
          <Card
            title="Prescribed Exercises"
            subtitle="Clinical rehabilitation routine"
            headerRight={
              <Link
                to={ROUTES.PATIENT.EXERCISES}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)' }}
              >
                View All &rarr;
              </Link>
            }
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading routine...</p>
              </div>
            ) : exercises.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                No exercises assigned.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {exercises.slice(0, 4).map((ex) => {
                  const id = ex.id || ex._id;
                  const isCompleted = sessions.some((s) => String(s.exerciseId) === String(id));
                  const title = ex.name || ex.title;
                  const sets = ex.defaultSets || ex.sets || 3;
                  const reps = ex.defaultReps || ex.reps || 10;

                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--color-surface)',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-indigo)',
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        >
                          🏃‍♂️
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {title}
                          </h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {sets} sets &bull; {reps} reps
                          </p>
                        </div>
                      </div>

                      {/* Right: Status & Action Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Badge variant={isCompleted ? 'success' : 'warning'}>
                          {isCompleted ? 'Completed' : 'Pending'}
                        </Badge>

                        <Link
                          to={`/patient/exercises/${id}`}
                          className={`btn btn-sm ${isCompleted ? 'btn-outline' : 'btn-primary'}`}
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pain Trend Card */}
          <Card
            title="Pain Trend (0–10 VAS Scale)"
            subtitle="Trajectory across recent exercise completions"
          >
            {painTrendData.length > 0 ? (
              <SimpleLineChart
                data={painTrendData}
                xKey="day"
                yKey="pain"
                height={160}
                strokeColor="#6366F1"
                yMin={0}
                yMax={10}
              />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>
                No pain data recorded yet. Complete an exercise session to view your trend curve.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Therapist Note & Next Exercise Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Clinical Guidance Card */}
          <Card
            title="Clinical Guidance"
            subtitle="Clinical Care Team"
          >
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                borderLeft: '4px solid var(--accent-mint)',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
              }}
            >
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                &ldquo;Focus on slow, controlled pacing and smooth alignment. Consistency and proper posture are the keys to long-term joint rehabilitation.&rdquo;
              </p>
            </div>
          </Card>

          {/* Next Exercise Card (Featured highlight banner) */}
          {nextExercise && (
            <div
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                color: '#ffffff',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-mint)' }}>
                  Up Next In Routine
                </span>
                <span style={{ fontSize: 18 }}>🎯</span>
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                  {nextExercise.name || nextExercise.title}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#C7D2FE' }}>
                  {nextExercise.defaultSets || 3} sets &bull; {nextExercise.defaultReps || 10} reps
                </p>
              </div>

              <Link
                to={`/patient/exercises/${nextExercise.id || nextExercise._id}`}
                className="btn btn-secondary btn-block"
                style={{ marginTop: 8 }}
              >
                Start Exercise &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
