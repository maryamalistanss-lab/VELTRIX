import { useAuth } from '../../hooks/useAuth';

export default function TherapistProfile() {
  const { user } = useAuth();

  const therapistName = user?.name || 'Not available';
  const therapistEmail = user?.email || 'Not available';
  const therapistRole = user?.role || 'THERAPIST';

  const initials = therapistName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="therapist-profile-page">
      <style>{`
        .therapist-profile-page {
          min-height: calc(100vh - 80px);
          padding: 42px 5%;
          color: #ffffff;
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 30px;
        }

        .profile-title {
          margin: 0 0 10px;
          font-size: 42px;
          line-height: 1.15;
          font-weight: 800;
          color: #173b7a;
        }

        .profile-subtitle {
          margin: 0;
          font-size: 20px;
          color: #8ca4c9;
        }

        .profile-main-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
          color: #14213d;
          margin-bottom: 28px;
        }

        .profile-identity {
          display: flex;
          align-items: center;
          gap: 22px;
          padding-bottom: 30px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e4e8f0;
        }

        .profile-avatar {
          width: 82px;
          height: 82px;
          min-width: 82px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #5367f5, #6258e8);
          color: #ffffff;
          font-size: 27px;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(83, 103, 245, 0.25);
        }

        .profile-name {
          margin: 0 0 7px;
          font-size: 28px;
          font-weight: 800;
          color: #12264d;
        }

        .profile-role {
          margin: 0;
          color: #627da6;
          font-size: 16px;
        }

        .profile-section-title {
          margin: 0 0 20px;
          font-size: 21px;
          font-weight: 800;
          color: #12264d;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .profile-info-card {
          border: 1px solid #e1e7f0;
          border-radius: 16px;
          padding: 21px;
          background: #f8fafc;
        }

        .profile-label {
          display: block;
          margin-bottom: 9px;
          font-size: 13px;
          font-weight: 700;
          color: #7183a1;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .profile-value {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #162b52;
          word-break: break-word;
        }

        .profile-status-card {
          margin-top: 20px;
          border-radius: 16px;
          padding: 20px;
          background: #f3f8f5;
          border: 1px solid #d8eee0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .profile-status-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #19b978;
          box-shadow: 0 0 0 5px rgba(25, 185, 120, 0.12);
        }

        .status-title {
          margin: 0;
          font-weight: 800;
          color: #173b35;
        }

        .status-description {
          margin: 3px 0 0;
          color: #688078;
          font-size: 14px;
        }

        .status-badge {
          padding: 8px 15px;
          border-radius: 999px;
          background: #dff7ea;
          color: #07915b;
          font-weight: 800;
          font-size: 13px;
        }

        @media (max-width: 700px) {
          .therapist-profile-page {
            padding: 28px 20px;
          }

          .profile-title {
            font-size: 32px;
          }

          .profile-subtitle {
            font-size: 17px;
          }

          .profile-main-card {
            padding: 22px;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-identity {
            align-items: flex-start;
          }

          .profile-status-card {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Therapist Profile</h1>
          <p className="profile-subtitle">
            Manage and view your therapist account information.
          </p>
        </div>

        <div className="profile-main-card">
          <div className="profile-identity">
            <div className="profile-avatar">
              {initials || 'TT'}
            </div>

            <div>
              <h2 className="profile-name">{therapistName}</h2>
              <p className="profile-role">
                Clinical Therapist
              </p>
            </div>
          </div>

          <h3 className="profile-section-title">
            Account Information
          </h3>

          <div className="profile-grid">
            <div className="profile-info-card">
              <span className="profile-label">Full Name</span>
              <p className="profile-value">{therapistName}</p>
            </div>

            <div className="profile-info-card">
              <span className="profile-label">Email Address</span>
              <p className="profile-value">{therapistEmail}</p>
            </div>

            <div className="profile-info-card">
              <span className="profile-label">Account Role</span>
              <p className="profile-value">{therapistRole}</p>
            </div>

            <div className="profile-info-card">
              <span className="profile-label">Portal</span>
              <p className="profile-value">Therapist Portal</p>
            </div>
          </div>

          <div className="profile-status-card">
            <div className="profile-status-left">
              <span className="status-dot"></span>

              <div>
                <p className="status-title">Account Status</p>
                <p className="status-description">
                  Your therapist account is currently authenticated.
                </p>
              </div>
            </div>

            <span className="status-badge">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}