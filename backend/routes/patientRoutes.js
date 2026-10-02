const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getPatientProgress } = require("../controllers/sessionController");

// All patient progress routes require authentication
router.use(authMiddleware);

// GET /api/patients/:id/progress - Get patient progress by ID (Allowed: PATIENT, THERAPIST)
router.get(
  "/:id/progress",
  roleMiddleware("PATIENT", "THERAPIST"),
  getPatientProgress
);

module.exports = router;
