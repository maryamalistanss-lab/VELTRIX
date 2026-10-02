import api from './api';

/**
 * Session Service
 * Interacts with /api/sessions backend endpoints.
 * Compliant with API-CONTRACT.md Section 6.18 - 6.21.
 */

export const sessionService = {
  /**
   * Get exercise sessions history (filtered by user role).
   * @param {Object} params - { limit, startDate }
   */
  async getSessions(params = {}) {
    const response = await api.get('/sessions', { params });
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
