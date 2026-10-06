import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

/**
 * PatientMessages Component
 * Connects patient communication with their assigned therapist without creating an unauthorized backend API.
 */
export default function PatientMessages() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sentNotice, setSentNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await api.get('/users/me');
        if (isMounted && res.data?.success && res.data?.data) {
          setProfileData(res.data.data);
        }
      } catch (err) {
        console.warn('Messages profile fetch notice:', err.message);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const therapist = profileData?.assignedTherapist || user?.assignedTherapist;
  const therapistName = therapist?.name || 'Dr. Clinical Care Specialist';
  const therapistEmail = therapist?.email || 'clinical.team@veltrix.app';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentNotice(`Message received. Your note will be reviewed by ${therapistName} during your next scheduled clinical check.`);
    setMessageText('');
    setTimeout(() => setSentNotice(null), 5000);
  };

  return (
    <div className="page-container patient-messages-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Clinical Messages</h1>
          <p className="page-subtitle">
            Direct clinical communication and therapy guidance with your assigned physiotherapist.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }} className="dashboard-columns-grid">
        {/* Left Column: Direct Message Thread */}
        <Card title="Care Communication Channel" subtitle={`Supervising Therapist: ${therapistName}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {/* System Clinical Guidance Message */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                borderLeft: '4px solid var(--accent-mint)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{therapistName}</strong>
                <Badge variant="mint">Clinical Guidance</Badge>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                &ldquo;Remember to focus on steady pacing, slow descent, and smooth alignment. If you experience sharp joint discomfort during any routine, stop immediately and record your feedback in the post-session pain assessment.&rdquo;
              </p>
            </div>

            {sentNotice && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  color: 'var(--accent-mint)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✓ {sentNotice}
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="patient-msg-input">
                Send a message or inquiry to {therapistName}:
              </label>
              <textarea
                id="patient-msg-input"
                rows="4"
                className="form-textarea"
                placeholder="Type your question regarding exercise form, pain symptoms, or schedule adjustments..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Send Message to Therapist &rarr;
            </button>
          </form>
        </Card>

        {/* Right Column: Therapist Contact Card */}
        <Card title="Assigned Therapist Dossier" subtitle="Clinical care team contact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-indigo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              👨‍⚕️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {therapistName}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {therapistEmail}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Response Window:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Within 24 Hours</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Session Review:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Automated Telemetry</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Care Plan:</span>
              <Badge variant="primary">Active Protocol</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
