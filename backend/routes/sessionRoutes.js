const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  logSession,
  updateSession,
  getSessions,
  getSessionById,
  getPatientSessions,
  getPatientProgress
} = require("../controllers/sessionController");

// All session routes require authentication
router.use(authMiddleware);

// POST /api/sessions - Log session (Allowed: PATIENT)
router.post(
  "/",
  roleMiddleware("PATIENT"),
  logSession
);

// GET /api/sessions - List sessions (Allowed: PATIENT, THERAPIST)
router.get(
  "/",
  roleMiddleware("PATIENT", "THERAPIST"),
  getSessions
);

// GET /api/sessions/progress - Patient Own Progress (Allowed: PATIENT)
// Must be defined before /:id
router.get(
  "/progress",
  roleMiddleware("PATIENT"),
  getPatientProgress
);

// GET /api/sessions/patient/:patientId/progress - Specific Patient Progress (Allowed: THERAPIST)
// Must be defined before /:id
router.get(
  "/patient/:patientId/progress",
  roleMiddleware("THERAPIST"),
  getPatientProgress
);

// GET /api/sessions/patient/:patientId - Specific Patient Session History (Allowed: THERAPIST)
// Must be defined before /:id
router.get(
  "/patient/:patientId",
  roleMiddleware("THERAPIST"),
  getPatientSessions
);

// GET /api/sessions/:id - Get Session Details by ID (Allowed: PATIENT, THERAPIST)
router.get(
  "/:id",
  roleMiddleware("PATIENT", "THERAPIST"),
  getSessionById
);

// PUT /api/sessions/:id - Update Session Details (Allowed: PATIENT, THERAPIST)
router.put(
  "/:id",
  roleMiddleware("PATIENT", "THERAPIST"),
  updateSession
);

// PATCH /api/sessions/:id - Partial Update Session Details (Allowed: PATIENT, THERAPIST)
router.patch(
  "/:id",
  roleMiddleware("PATIENT", "THERAPIST"),
  updateSession
);

module.exports = router;