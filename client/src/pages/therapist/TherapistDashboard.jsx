import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatCard from '../../components/common/StatCard';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import {
  currentClinicianProfile,
  therapistDashboardMetrics,
  recentActivities,
  sessionsOverviewWeekly,
  topPerformingPatients,
  todaysPendingAlerts,
} from '../../data/therapistMockData';
import { ROUTES } from '../../utils/constants';

/**
 * TherapistDashboard Component
 * Replicates Screen 2 of Therapist App in Image 1 & 2.
 */
export default function TherapistDashboard() {
  const clinician = currentClinicianProfile;
  const metrics = therapistDashboardMetrics;

  return (
    <div className="page-container therapist-dashboard-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {clinician.name} &bull; Clinical care command center
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={ROUTES.THERAPIST.ASSIGN} className="btn btn-primary">
            + Assign Exercise
          </Link>
        </div>
      </div>

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
          label="Total Patients"
          value={metrics.totalPatients.value}
          delta={metrics.totalPatients.delta}
          isPositive={metrics.totalPatients.isPositive}
          icon={<span>👥</span>}
        />
        <StatCard
          label="Active Exercises"
          value={metrics.activeExercises.value}
          delta={metrics.activeExercises.delta}
          isPositive={metrics.activeExercises.isPositive}
          icon={<span>🏋️</span>}
        />
        <StatCard
          label="Sessions This Week"
          value={metrics.sessionsThisWeek.value}
          delta={metrics.sessionsThisWeek.delta}
          isPositive={metrics.sessionsThisWeek.isPositive}
          icon={<span>📈</span>}
        />
        <StatCard
          label="Completion Rate"
          value={metrics.completionRate.value}
          delta={metrics.completionRate.delta}
          isPositive={metrics.completionRate.isPositive}
          icon={<span>🎯</span>}
        />
      </div>

      {/* Main Grid: Left Column (Recent Activity & Sessions Chart) + Right Column (Top Performing & Today's Pending) */}
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
          {/* Recent Activity */}
          <Card
            title="Recent Activity"
            subtitle="Live patient telemetry and exercise completions"
            headerRight={
              <Link
                to={ROUTES.THERAPIST.SESSIONS}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-indigo)' }}
              >
                View All Activity
              </Link>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-elevated)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: act.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: act.status === 'completed' ? 'var(--accent-mint)' : 'var(--color-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {act.status === 'completed' ? '✓' : '!'}
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.patientName}{' '}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {act.action}
                      </span>
                      <p style={{ margin: '2px 0 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                        {act.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sessions Overview (This Week) */}
          <Card
            title="Sessions Overview (This Week)"
            subtitle="Daily completed rehabilitation routines"
          >
            <SimpleLineChart
              data={sessionsOverviewWeekly}
              xKey="day"
              yKey="sessions"
              height={160}
              strokeColor="#6366F1"
              yMin={0}
              yMax={10}
            />
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Performing Patients */}
          <Card
            title="Top Performing Patients"
            subtitle="Adherence and consistency ranking"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topPerformingPatients.map((p) => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                    <strong style={{ color: 'var(--primary-indigo)' }}>{p.completionRate}%</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill progress-bar-fill-mint"
                      style={{ width: `${p.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Pending Alerts */}
          <Card
            title="Today's Pending"
            subtitle="Tasks requiring clinical attention"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todaysPendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: alert.type === 'warning' ? 'var(--color-warning-border)' : 'var(--color-info-border)',
                    background: alert.type === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                  }}
                >
                  <span style={{ fontSize: 20 }}>
                    {alert.type === 'warning' ? '👥' : '📋'}
                  </span>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alert.count}{' '}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {alert.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
