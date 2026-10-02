import api from './api';

/**
 * Exercise Service
 * Interacts with /api/exercises backend endpoints.
 * Compliant with API-CONTRACT.md Section 6.13 - 6.17.
 */

export const exerciseService = {
  /**
   * List exercises with optional filters.
   * @param {Object} params - { targetBodyPart, difficulty }
   */
  async getExercises(params = {}) {
    const response = await api.get('/exercises', { params });
    return response.data;
  },

  /**
   * Get exercise details by ID.
   * @param {string} id - Exercise ObjectId
   */
  async getExerciseById(id) {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  /**
   * Create a new exercise entry (Therapist only).
   * @param {Object} exerciseData - { name, description, targetBodyPart, difficulty, defaultSets, defaultReps, defaultDurationSeconds, instructions, demonstrationMedia, safetyInstructions }
   */
  async createExercise(exerciseData) {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  },

  /**
   * Update an existing exercise (Therapist only).
   * @param {string} id - Exercise ObjectId
   * @param {Object} exerciseData - Updated exercise fields
   */
  async updateExercise(id, exerciseData) {
    const response = await api.put(`/exercises/${id}`, exerciseData);
    return response.data;
  },

  /**
   * Delete an exercise (Therapist only).
   * @param {string} id - Exercise ObjectId
   */
  async deleteExercise(id) {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
};

export default exerciseService;
