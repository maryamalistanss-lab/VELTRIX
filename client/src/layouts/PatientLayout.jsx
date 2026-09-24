import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PatientSidebar from '../components/navigation/PatientSidebar';
import TopBar from '../components/navigation/TopBar';
import MobileNavigation from '../components/navigation/MobileNavigation';

/**
 * PatientLayout
 * Modern App Shell with fixed dark sidebar, sticky topbar with search & profile,
 * and responsive mobile navigation drawer and bottom tabs.
 */
export default function PatientLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="veltrix-app-shell patient-portal-shell">
      {/* Desktop Sidebar (and mobile drawer) */}
      <PatientSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="veltrix-main-area">
        {/* Mobile Header */}
        <MobileNavigation
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Desktop TopBar */}
        <TopBar
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Nested Content */}
        <main className="layout-content-area" role="main">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 35 }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
