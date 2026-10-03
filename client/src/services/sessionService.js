import api from './api';

/**
 * Session Service
 * Interacts with /api/sessions backend endpoints.
 * Compliant with API-CONTRACT.md Section 6.18 - 6.21.
 */

export const sessionService = {
  /**
   * Create / log a completed exercise session (Patient only).
   * patientId is derived by the backend from the authenticated JWT token.
   * @param {Object} sessionData - { exerciseId, setsCompleted, repsCompleted, durationSeconds,
   *                                 painBefore, painAfter, perceivedDifficulty, notes, sessionResults }
   */
  async createSession(sessionData) {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  /**
   * Get exercise sessions history (filtered by user role).
   * For PATIENT role, the backend automatically filters by the authenticated patient's ID.
   * @param {Object} params - { limit, startDate }
   */
  async getSessions(params = {}) {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  /**
   * Get patient's own progress analytics (Patient only).
   * Returns aggregated stats calculated from real ExerciseSession records.
   */
  async getMyProgress() {
    const response = await api.get('/sessions/progress');
    return response.data;
  },

  /**
   * Get specific session details by ID.
   * @param {string} id - Session ObjectId
   */
  async getSessionById(id) {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  /**
   * Get session history for a specific patient (Therapist only).
   * @param {string} patientId - Patient User ObjectId
   */
  async getPatientSessions(patientId) {
    const response = await api.get(`/sessions/patient/${patientId}`);
    return response.data;
  },
};

export default sessionService;
