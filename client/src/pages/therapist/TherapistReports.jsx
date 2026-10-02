export default function TherapistReports() {
  return (
    <div className="therapist-reports-page">
      <style>{`
        .therapist-reports-page {
          min-height: calc(100vh - 80px);
          padding: 42px 5%;
          color: #ffffff;
        }

        .reports-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .reports-header {
          margin-bottom: 30px;
        }

        .reports-title {
          margin: 0 0 10px;
          font-size: 42px;
          line-height: 1.15;
          font-weight: 800;
          color: #173b7a;
        }

        .reports-subtitle {
          margin: 0;
          font-size: 20px;
          color: #8ca4c9;
        }

        .reports-overview {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .report-summary-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          color: #14213d;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .report-summary-label {
          margin: 0 0 14px;
          color: #6880a6;
          font-size: 15px;
          font-weight: 700;
        }

        .report-summary-title {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          color: #172d55;
        }

        .reports-main-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 34px;
          color: #14213d;
          min-height: 390px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
        }

        .reports-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e4e8f0;
        }

        .reports-card-title {
          margin: 0 0 7px;
          font-size: 24px;
          font-weight: 800;
          color: #12264d;
        }

        .reports-card-description {
          margin: 0;
          color: #7184a5;
          font-size: 15px;
        }

        .reports-empty {
          min-height: 270px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }

        .reports-empty-icon {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 20px;
        }

        .reports-empty-title {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 800;
          color: #172d55;
        }

        .reports-empty-text {
          max-width: 560px;
          margin: 0;
          color: #7184a5;
          line-height: 1.6;
        }

        .reports-info {
          margin-top: 25px;
          padding: 18px 20px;
          border-radius: 15px;
          background: #f5f8fc;
          border: 1px solid #e3e9f1;
          color: #617696;
          font-size: 14px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          .therapist-reports-page {
            padding: 28px 20px;
          }

          .reports-title {
            font-size: 32px;
          }

          .reports-subtitle {
            font-size: 17px;
          }

          .reports-overview {
            grid-template-columns: 1fr;
          }

          .reports-main-card {
            padding: 22px;
          }

          .reports-card-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="reports-container">
        <div className="reports-header">
          <h1 className="reports-title">Therapist Reports</h1>

          <p className="reports-subtitle">
            View clinical and rehabilitation reports.
          </p>
        </div>

        <div className="reports-overview">
          <div className="report-summary-card">
            <p className="report-summary-label">
              Report Center
            </p>

            <h2 className="report-summary-title">
              Clinical Reports
            </h2>
          </div>

          <div className="report-summary-card">
            <p className="report-summary-label">
              Report Type
            </p>

            <h2 className="report-summary-title">
              Rehabilitation
            </h2>
          </div>

          <div className="report-summary-card">
            <p className="report-summary-label">
              Availability
            </p>

            <h2 className="report-summary-title">
              Awaiting Data
            </h2>
          </div>
        </div>

        <div className="reports-main-card">
          <div className="reports-card-header">
            <div>
              <h2 className="reports-card-title">
                Clinical Reports
              </h2>

              <p className="reports-card-description">
                Review generated clinical and rehabilitation reports.
              </p>
            </div>
          </div>

          <div className="reports-empty">
            <div className="reports-empty-icon">
              📋
            </div>

            <h3 className="reports-empty-title">
              No Reports Available
            </h3>

            <p className="reports-empty-text">
              No clinical reports have been generated yet.
              Reports will appear here when relevant clinical
              activity and report data become available.
            </p>
          </div>

          <div className="reports-info">
            Reports are displayed using data available to the
            authenticated therapist. No sample or placeholder
            clinical reports are being shown.
          </div>
        </div>
      </div>
    </div>
  );
}