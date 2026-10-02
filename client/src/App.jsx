import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import TherapistLayout from './layouts/TherapistLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/brand/SplashScreen';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Patient Pages (7 Screens)
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientExercises from './pages/patient/PatientExercises';
import PatientExerciseDetails from './pages/patient/PatientExerciseDetails';
import PatientExerciseSession from './pages/patient/PatientExerciseSession';
import PatientPainFeedback from './pages/patient/PatientPainFeedback';
import PatientSessionSummary from './pages/patient/PatientSessionSummary';
import PatientProgress from './pages/patient/PatientProgress';

// Therapist Pages (6 Screens)
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import TherapistProfile from './pages/therapist/TherapistProfile';
import TherapistReports from './pages/therapist/TherapistReports';
import TherapistPatients from './pages/therapist/TherapistPatients';
import TherapistPatientDetails from './pages/therapist/TherapistPatientDetails';
import TherapistExercises from './pages/therapist/TherapistExercises';
import TherapistExerciseDetails from './pages/therapist/TherapistExerciseDetails';
import TherapistAssignExercise from './pages/therapist/TherapistAssignExercise';
import TherapistPatientProgress from './pages/therapist/TherapistPatientProgress';
import TherapistNotes from './pages/therapist/TherapistNotes';
import TherapistSessions from './pages/therapist/TherapistSessions';

// Styles
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem('veltrix_splash_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('veltrix_splash_seen', 'true');
    } catch {
      // Ignored
    }
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= PATIENT (7 SCREENS) ================= */}
        <Route element={<ProtectedRoute allowedRole="PATIENT" />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />

            {/* Screen 2: Dashboard */}
            <Route path="dashboard" element={<PatientDashboard />} />

            {/* Exercises Library */}
            <Route path="exercises" element={<PatientExercises />} />

            {/* Screen 3: Exercise Details */}
            <Route
              path="exercises/:exerciseId"
              element={<PatientExerciseDetails />}
            />

            {/* Screen 4: Guided / Camera Session */}
            <Route
              path="exercises/:exerciseId/guided"
              element={<PatientExerciseSession />}
            />

            <Route
              path="exercises/:exerciseId/session"
              element={<PatientExerciseSession />}
            />

            {/* Screen 5: Post-Exercise Pain & Difficulty */}
            <Route
              path="exercises/:exerciseId/feedback"
              element={<PatientPainFeedback />}
            />

            {/* Screen 6: Session Summary */}
            <Route
              path="exercises/:exerciseId/summary"
              element={<PatientSessionSummary />}
            />

            {/* Screen 7: My Progress */}
            <Route path="progress" element={<PatientProgress />} />

            {/* Secondary navigation fallbacks */}
            <Route path="sessions" element={<PatientProgress />} />
            <Route path="pain-history" element={<PatientProgress />} />
            <Route path="messages" element={<PatientDashboard />} />
            <Route path="profile" element={<PatientDashboard />} />
            <Route path="settings" element={<PatientDashboard />} />
          </Route>
        </Route>

        {/* ================= THERAPIST (6 SCREENS) ================= */}
        <Route element={<ProtectedRoute allowedRole="THERAPIST" />}>
          <Route path="/therapist" element={<TherapistLayout />}>
            <Route
              index
              element={<Navigate to="/therapist/dashboard" replace />}
            />

            {/* Screen 2: Clinical Dashboard */}
            <Route path="dashboard" element={<TherapistDashboard />} />

            {/* Screen 3: Patient List */}
            <Route path="patients" element={<TherapistPatients />} />

            <Route
              path="patients/:patientId"
              element={<TherapistPatientDetails />}
            />

            <Route
              path="patients/:patientId/assign"
              element={<TherapistAssignExercise />}
            />

            {/* Screen 6: Patient Progress & Session Details */}
            <Route
              path="patients/:patientId/progress"
              element={<TherapistPatientProgress />}
            />

            <Route
              path="patients/:patientId/notes"
              element={<TherapistNotes />}
            />

            {/* Screen 4: Exercise Management */}
            <Route path="exercises" element={<TherapistExercises />} />

            <Route
              path="exercises/:exerciseId"
              element={<TherapistExerciseDetails />}
            />

            {/* Screen 5: Prescribe / Assign Exercise */}
            <Route path="assign" element={<TherapistAssignExercise />} />

            <Route path="sessions" element={<TherapistSessions />} />

            {/* Therapist Reports */}
            <Route path="reports" element={<TherapistReports />} />

            <Route path="notes" element={<TherapistNotes />} />

            {/* Therapist Profile */}
            <Route path="profile" element={<TherapistProfile />} />
          </Route>
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;