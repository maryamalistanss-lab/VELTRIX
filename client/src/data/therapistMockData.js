/**
 * Legacy mock data placeholder.
 * Real therapist and patient metrics must come from the backend APIs and authenticated users.
 */

export const currentClinicianProfile = {
 id: 'therapist-placeholder',
 name: 'Clinical Therapist',
 role: 'Therapist',
 department: 'Rehabilitation',
 avatarInitials: 'CT',
};

export const therapistDashboardMetrics = {
 totalPatients: { value: 0, delta: 'Awaiting data', isPositive: true },
 activeExercises: { value: 0, delta: 'Awaiting data', isPositive: true },
 sessionsThisWeek: { value: 0, delta: 'Awaiting data', isPositive: true },
 completionRate: { value: '0%', delta: 'Awaiting data', isPositive: true },
};

export const recentActivities = [];

export const sessionsOverviewWeekly = [];

export const topPerformingPatients = [];

export const todaysPendingAlerts = [];

export const clinicalPatientDirectory = [];
