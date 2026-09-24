import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import SimpleLineChart from '../../components/common/SimpleLineChart';
import Modal from '../../components/common/Modal';
import {
  sessionHistoryRecords,
  monthlyProgressStats,
  monthlyPainTrendData,
} from '../../data/progressMockData';
import { clinicalPatientDirectory } from '../../data/therapistMockData';

/**
 * TherapistPatientProgress Component
 * Replicates Screen 6 of Therapist App in Image 1 & 2 (Patient Progress / Session Details).
 */
export default function TherapistPatientProgress() {
  const { patientId = 'pt-101' } = useParams();
  const [activeTab, setActiveTab] = useState('sessions'); // overview | sessions | progress | notes
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const patient =
    clinicalPatientDirectory.find((p) => p.id === patientId) ||
    clinicalPatientDirectory[0];

  const stats = monthlyProgressStats;

  return (
    <div className="page-container therapist-progress-page">
      {/* Patient Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar avatar-lg">
            <span>{patient.name[0]}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 22, margin: 0 }}>
                {patient.name}
              </h1>
              <Badge variant="mint">Active Patient</Badge>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              {patient.age} yrs &bull; {patient.condition} &bull; rahul.mehta@email.com
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsAddNoteModalOpen(true)}
            className="btn btn-outline"
          >
            + Add Note
          </button>
          <Link
            to={`/therapist/patients/${patient.id}/assign`}
            className="btn btn-primary"
          >
            Assign Exercise
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
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
          { id: 'sessions', label: 'Sessions' },
          { id: 'progress', label: 'Progress' },
          { id: 'notes', label: 'Notes' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="kpi-card" style={{ padding: 16 }}>
          <span className="kpi-label">Total Sessions</span>
          <div className="kpi-value" style={{ fontSize: 24 }}>{stats.totalSessionsThisMonth}</div>
        </div>

        <div className="kpi-card" style={{ padding: 16 }}>
          <span className="kpi-label">Completed</span>
          <div className="kpi-value" style={{ fontSize: 24, color: 'var(--accent-mint)' }}>
            {stats.completedSessionsCount} ({stats.completedSessionsPercentage}%)
          </div>
        </div>

        <div className="kpi-card" style={{ padding: 16 }}>
          <span className="kpi-label">Missed</span>
          <div className="kpi-value" style={{ fontSize: 24, color: 'var(--color-error)' }}>
            {stats.missedSessionsCount} ({stats.missedSessionsPercentage}%)
          </div>
        </div>

        <div className="kpi-card" style={{ padding: 16 }}>
          <span className="kpi-label">Avg. Pain (Last 7 Days)</span>
          <div className="kpi-value" style={{ fontSize: 24, color: 'var(--primary-indigo)' }}>
            {stats.averagePainLast7Days}
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sessions' && (
        <Card title="Session History">
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
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessionHistoryRecords.map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: 600 }}>{sess.date}</td>
                    <td>{sess.exercise}</td>
                    <td>{sess.setsReps}</td>
                    <td>{sess.painBefore !== '-' ? `${sess.painBefore}/5` : '-'}</td>
                    <td>
                      {sess.painAfter !== '-' ? (
                        <span style={{ color: 'var(--accent-mint)', fontWeight: 600 }}>
                          {sess.painAfter}/5
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{sess.difficulty}</td>
                    <td>
                      <Badge variant={sess.status === 'Completed' ? 'success' : 'danger'}>
                        {sess.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn btn-outline btn-sm">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'overview' && (
        <Card title="Clinical Recovery Summary">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Patient is progressing consistently through Phase II active-assisted exercises with
            favorable tolerance. ROM has improved by +24° over baseline with steadily decreasing
            post-session pain ratings.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link
              to={`/therapist/patients/${patient.id}/assign`}
              className="btn btn-primary"
            >
              Adjust Exercise Dosage
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'progress' && (
        <Card title="Pain & Compliance Trajectory">
          <SimpleLineChart
            data={monthlyPainTrendData}
            xKey="week"
            yKey="pain"
            height={200}
            strokeColor="#6366F1"
            yMin={0}
            yMax={5}
          />
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card title="Therapist Clinical Notes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>Dr. Priya Sharma</strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>24 May 2024</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                Patient reports improved ease of knee extension. Ready to introduce low-resistance
                band exercises next week.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title={`Add Clinical Note for ${patient.name}`}
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddNoteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIsAddNoteModalOpen(false);
                setNoteContent('');
              }}
            >
              Save Note
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Note Content:</label>
          <textarea
            rows="4"
            className="form-textarea"
            placeholder="Enter clinical observations, ROM findings, or modifications..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
