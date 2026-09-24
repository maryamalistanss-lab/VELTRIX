/**
 * Application Constants for VELTRIX
 * VELTRIX = Vitality + Elevation + Tracking + IX (Intelligent Experience)
 */

export const APP_NAME = 'VELTRIX';
export const APP_TAGLINE = 'Rehabilitation & Care Management Platform';

export const USER_ROLES = {
  PATIENT: 'PATIENT',
  THERAPIST: 'THERAPIST',
};

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PATIENT: {
    ROOT: '/patient',
    DASHBOARD: '/patient/dashboard',
    EXERCISES: '/patient/exercises',
    EXERCISE_DETAILS: '/patient/exercises/:exerciseId',
    GUIDED_SESSION: '/patient/exercises/:exerciseId/guided',
    SESSION_VIEW: '/patient/exercises/:exerciseId/session',
    PAIN_FEEDBACK: '/patient/exercises/:exerciseId/feedback',
    SESSION_SUMMARY: '/patient/exercises/:exerciseId/summary',
    PROGRESS: '/patient/progress',
  },
  THERAPIST: {
    ROOT: '/therapist',
    DASHBOARD: '/therapist/dashboard',
    PATIENTS: '/therapist/patients',
    PATIENT_DETAILS: '/therapist/patients/:patientId',
    PATIENT_ASSIGN: '/therapist/patients/:patientId/assign',
    PATIENT_PROGRESS: '/therapist/patients/:patientId/progress',
    PATIENT_NOTES: '/therapist/patients/:patientId/notes',
    EXERCISES: '/therapist/exercises',
    EXERCISE_DETAILS: '/therapist/exercises/:exerciseId',
    ASSIGN: '/therapist/assign',
    SESSIONS: '/therapist/sessions',
  },
};

