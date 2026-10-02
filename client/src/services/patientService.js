import api from './api';

/**
 * Patient Service
 * Interacts with /api/users/patients backend endpoints.
 * Compliant with API-CONTRACT.md Section 6.6 - 6.12.
 */

export const patientService = {
  /**
   * Retrieve list of all patient accounts managed by therapists.
   * @param {Object} params - { search }
   */
  async getPatients(params = {}) {
    const response = await api.get('/users/patients', { params });
    return response.data;
  },

  /**
   * Get detailed patient record (Therapist only).
   * @param {string} patientId - Patient User ObjectId
   */
  async getPatientById(patientId) {
    const response = await api.get(`/users/patients/${patientId}`);
    return response.data;
  },

  /**
   * Assign an exercise subdocument to a patient (Therapist only).
   * @param {string} patientId - Patient User ObjectId
   * @param {Object} assignmentData - { exerciseId, targetSets, targetReps, targetDurationSeconds, frequency, dueDate, therapistNotes }
   */
  async assignExercise(patientId, assignmentData) {
    const response = await api.post(`/users/patients/${patientId}/assignments`, assignmentData);
    return response.data;
  },

  /**
   * Update an assignment subdocument.
   * @param {string} patientId - Patient User ObjectId
   * @param {string} assignmentId - Assignment Subdocument ObjectId
   * @param {Object} data - Updated assignment fields
   */
  async updateAssignment(patientId, assignmentId, data) {
    const response = await api.put(`/users/patients/${patientId}/assignments/${assignmentId}`, data);
    return response.data;
  },

  /**
   * Remove/cancel an assignment subdocument (Therapist only).
   * @param {string} patientId - Patient User ObjectId
   * @param {string} assignmentId - Assignment Subdocument ObjectId
   */
  async deleteAssignment(patientId, assignmentId) {
    const response = await api.delete(`/users/patients/${patientId}/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Retrieve clinical notes recorded for a patient.
   * @param {string} patientId - Patient User ObjectId
   */
  async getPatientNotes(patientId) {
    const response = await api.get(`/users/patients/${patientId}/notes`);
    return response.data;
  },

  /**
   * Add a therapist clinical note subdocument (Therapist only).
   * @param {string} patientId - Patient User ObjectId
   * @param {Object} noteData - { note }
   */
  async addPatientNote(patientId, noteData) {
    const response = await api.post(`/users/patients/${patientId}/notes`, noteData);
    return response.data;
  },
};

export default patientService;
