import { useState } from 'react';
import Card from '../../components/Card';
import CircularProgress from '../../components/common/CircularProgress';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import Badge from '../../components/common/Badge';
import {
  monthlyProgressStats,
  monthlyPainTrendData,
  sessionHistoryRecords,
} from '../../data/progressMockData';

/**
 * PatientProgress Component
 * Replicates Screen 7 of Patient App in Image 1 & 2 (My Progress).
 */
export default function PatientProgress() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | exercises | pain | history

  const stats = monthlyProgressStats;

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

      {/* Top Stat Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Exercise Completion Ring */}
        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="kpi-label">Exercise Completion</span>
            <div className="kpi-value">{stats.completionPercentage}%</div>
            <p className="kpi-subtext">
              {stats.completedExercisesCount} of {stats.totalPrescribedExercisesCount} exercises
            </p>
          </div>
          <CircularProgress
            value={stats.completionPercentage}
            size={60}
            strokeWidth={6}
            color="#10B981"
          />
        </div>

        {/* Total Sessions */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Sessions</span>
            <span style={{ fontSize: 18 }}>📅</span>
          </div>
          <div className="kpi-value">{stats.totalSessionsThisMonth}</div>
          <p className="kpi-subtext">This Month</p>
        </div>

        {/* Current Streak */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Current Streak</span>
            <span style={{ fontSize: 18 }}>🔥</span>
          </div>
          <div className="kpi-value">{stats.currentStreakDays} Days</div>
          <p className="kpi-subtext">Keep it up!</p>
        </div>
      </div>

      {/* Pain Trend (This Month) Card */}
      <Card
        title="Pain Trend (This Month)"
        subtitle="Self-reported VAS pain trajectory across rehabilitation weeks"
        style={{ marginBottom: 28 }}
      >
        <SimpleLineChart
          data={monthlyPainTrendData}
          xKey="week"
          yKey="pain"
          height={180}
          strokeColor="#6366F1"
          yMin={0}
          yMax={5}
        />
      </Card>

      {/* Historical Session Log Table */}
      <Card
        title="Session History"
        subtitle="Past completed rehabilitation exercises and telemetry recordings"
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercise</th>
                <th>Sets / Reps</th>
                <th>Pain Before</th>
                <th>Pain After</th>
                <th>Difficulty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessionHistoryRecords.map((rec) => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 600 }}>{rec.date}</td>
                  <td>{rec.exercise}</td>
                  <td>{rec.setsReps}</td>
                  <td>{rec.painBefore !== '-' ? `${rec.painBefore}/5` : '-'}</td>
                  <td>
                    {rec.painAfter !== '-' ? (
                      <span style={{ color: 'var(--accent-mint)', fontWeight: 600 }}>
                        {rec.painAfter}/5
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{rec.difficulty}</td>
                  <td>
                    <Badge variant={rec.status === 'Completed' ? 'success' : 'danger'}>
                      {rec.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
