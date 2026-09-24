import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import CircularProgress from '../../components/common/CircularProgress';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import {
  currentPatientProfile,
  todaysPrescribedExercises,
  weeklyPainTrend,
} from '../../data/patientMockData';
import { ROUTES } from '../../utils/constants';

/**
 * PatientDashboard Component
 * Replicates Screen 2 of Patient App in Image 1 & 2 and Design Board.
 */
export default function PatientDashboard() {
  const patient = currentPatientProfile;

  return (
    <div className="page-container patient-dashboard-page">
      {/* Welcome Greeting Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Hello, {patient.preferredName} 🖐</h1>
          <p className="page-subtitle">
            Let's complete your exercises for today. Small steps lead to big changes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            to={ROUTES.PATIENT.EXERCISES}
            className="btn btn-primary"
          >
            Start Today's Session &rarr;
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
            <span className="kpi-label">Today's Progress</span>
            <div className="kpi-value">{patient.completionRate}%</div>
            <p className="kpi-subtext">3 of 4 exercises completed</p>
          </div>
          <CircularProgress
            value={patient.completionRate}
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
          <div className="kpi-value">{patient.streakDays} Days</div>
          <p className="kpi-subtext">Keep it up! Personal best</p>
        </div>

        {/* This Week Compliance */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">This Week</span>
            <span className="kpi-delta kpi-delta-positive">↑ 4%</span>
          </div>
          <div className="kpi-value">{patient.weeklyCompliance}%</div>
          <p className="kpi-subtext">Protocol adherence</p>
        </div>

        {/* Total Minutes */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Minutes</span>
            <span style={{ fontSize: 18 }}>⏱️</span>
          </div>
          <div className="kpi-value">{patient.totalMinutesThisWeek}</div>
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
        {/* Left Column: Today's Exercises & Pain Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Today's Exercises Card */}
          <Card
            title="Today's Exercises"
            subtitle="Prescribed daily routine"
            headerRight={
              <Link
                to={ROUTES.PATIENT.EXERCISES}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)' }}
              >
                View All
              </Link>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {todaysPrescribedExercises.map((ex) => (
                <div
                  key={ex.id}
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
                        {ex.title}
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {ex.sets} sets &bull; {ex.reps} reps
                      </p>
                    </div>
                  </div>

                  {/* Right: Progress ring & Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <CircularProgress
                      value={ex.progress}
                      size={38}
                      strokeWidth={4}
                      color={ex.progress === 100 ? '#10B981' : '#4F46E5'}
                    />

                    <Badge
                      variant={
                        ex.status === 'Completed'
                          ? 'success'
                          : ex.status === 'In Progress'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {ex.status}
                    </Badge>

                    <Link
                      to={`/patient/exercises/${ex.id}`}
                      className={`btn btn-sm ${
                        ex.status === 'Completed'
                          ? 'btn-outline'
                          : ex.status === 'In Progress'
                          ? 'btn-secondary'
                          : 'btn-primary'
                      }`}
                    >
                      {ex.status === 'Completed'
                        ? 'Review'
                        : ex.status === 'In Progress'
                        ? 'Continue'
                        : 'Start'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pain Trend (This Week) */}
          <Card
            title="Pain Trend (This Week)"
            subtitle="Daily self-reported VAS score (1 to 5)"
          >
            <SimpleLineChart
              data={weeklyPainTrend}
              xKey="day"
              yKey="pain"
              height={160}
              strokeColor="#6366F1"
              yMin={0}
              yMax={5}
            />
          </Card>
        </div>

        {/* Right Column: Therapist Note & Next Exercise Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Therapist Note Card */}
          <Card
            title="Therapist Note"
            subtitle={`From ${patient.assignedTherapist}`}
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
                "{patient.therapistNote}"
              </p>
            </div>
          </Card>

          {/* Next Exercise Card (Featured highlight banner) */}
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
                {patient.nextExercise.title}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#C7D2FE' }}>
                {patient.nextExercise.sets} sets &bull; {patient.nextExercise.reps} reps &bull; {patient.nextExercise.duration}
              </p>
            </div>

            <Link
              to={`/patient/exercises/${patient.nextExercise.id}`}
              className="btn btn-secondary btn-block"
              style={{ marginTop: 8 }}
            >
              Continue Exercise &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
