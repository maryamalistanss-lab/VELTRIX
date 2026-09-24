import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TherapistSidebar from '../components/navigation/TherapistSidebar';
import TopBar from '../components/navigation/TopBar';
import MobileNavigation from '../components/navigation/MobileNavigation';

/**
 * TherapistLayout
 * Unified clinical workspace shell with desktop sidebar, topbar, and mobile navigation.
 */
export default function TherapistLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="veltrix-app-shell therapist-portal-shell">
      {/* Desktop Sidebar (and mobile drawer) */}
      <TherapistSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Clinical Area */}
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
