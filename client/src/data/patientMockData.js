/**
 * Legacy mock data placeholder.
 * Real patient data must come from the authenticated user and backend APIs.
 */

export const currentPatientProfile = {
  id: 'patient-placeholder',
  name: 'Patient Profile',
  preferredName: 'Patient',
  email: 'patient@example.com',
  age: 0,
  condition: 'Rehabilitation Care',
  primaryJoint: 'General',
  streakDays: 0,
  completionRate: 0,
  weeklyCompliance: 0,
  totalMinutesThisWeek: 0,
  assignedTherapist: 'Clinical Therapist',
  therapistNote: 'Therapist notes are loaded from the backend for the authenticated patient.',
  nextExercise: {
    id: 'exercise-placeholder',
    title: 'Assigned Exercise',
    sets: 0,
    reps: 0,
    duration: '0 mins',
    status: 'Pending',
  },
};

export const todaysPrescribedExercises = [];

export const weeklyPainTrend = [];
