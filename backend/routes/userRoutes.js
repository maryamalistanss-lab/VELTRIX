const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

// All user routes require authentication
router.use(authMiddleware);

// Profile routes (PATIENT and THERAPIST)
router.get("/me", roleMiddleware("PATIENT", "THERAPIST"), userController.getMe);
router.put("/me", roleMiddleware("PATIENT", "THERAPIST"), userController.updateMe);

// Patient management routes (Therapist Only)
router.get("/patients", roleMiddleware("THERAPIST"), userController.getPatients);
router.get("/patients/:id", roleMiddleware("THERAPIST"), userController.getPatientById);

// Exercise assignments subdocument routes
router.post(
  "/patients/:id/assignments",
  roleMiddleware("THERAPIST"),
  userController.assignExercise
);

router.put(
  "/patients/:id/assignments/:assignmentId",
  roleMiddleware("PATIENT", "THERAPIST"),
  userController.updateAssignment
);

router.delete(
  "/patients/:id/assignments/:assignmentId",
  roleMiddleware("THERAPIST"),
  userController.deleteAssignment
);

// Therapist clinical notes subdocument routes (Therapist Only)
router.post(
  "/patients/:id/notes",
  roleMiddleware("THERAPIST"),
  userController.addNote
);

router.get(
  "/patients/:id/notes",
  roleMiddleware("THERAPIST"),
  userController.getNotes
);

module.exports = router;
