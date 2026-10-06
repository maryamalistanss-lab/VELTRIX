import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

/**
 * PatientProfile Component
 * Displays authenticated patient identity and assigned clinical therapist.
 */
export default function PatientProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const res = await api.get('/users/me');
        if (isMounted && res.data?.success && res.data?.data) {
          setProfileData(res.data.data);
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const patientName = profileData?.name || user?.name || 'Rehabilitation Patient';
  const patientEmail = profileData?.email || user?.email || 'patient@veltrix.app';
  const assignedTherapist = profileData?.assignedTherapist || user?.assignedTherapist;

  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PT';

  return (
    <div className="page-container patient-profile-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Patient Profile</h1>
          <p className="page-subtitle">
            Manage your personal rehabilitation identity and review your assigned clinical therapist.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24 }} className="dashboard-columns-grid">
        {/* Left Column: Patient Identity & Information */}
        <Card title="Account Dossier" subtitle="Authenticated patient record">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
            <div
              className="avatar"
              style={{
                width: 68,
                height: 68,
                fontSize: 24,
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-dark) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {initials}
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                {patientName}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                {patientEmail}
              </p>
              <div style={{ marginTop: 8 }}>
                <Badge variant="mint">Active Patient Account</Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Account Role
              </span>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Patient</strong>
            </div>

            <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Portal Interface
              </span>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Patient Rehabilitation Portal</strong>
            </div>
          </div>
        </Card>

        {/* Right Column: Assigned Clinical Therapist */}
        <Card title="Assigned Clinical Therapist" subtitle="Direct supervising physical therapist">
          {assignedTherapist ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)', border: '1px solid var(--border-color)' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-mint)',
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
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {assignedTherapist.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {assignedTherapist.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)',
                  borderLeft: '4px solid var(--accent-mint)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--accent-mint)' }}>
                  Clinical Protocol Supervision
                </strong>
                Your rehabilitation routine, exercise dosages, and session pain feedback are actively monitored by your assigned therapist.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>🏥</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 6px 0' }}>
                Under Primary Clinical Care Team
              </p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Your clinical care protocol is assigned and supervised by our licensed rehabilitation staff.
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
