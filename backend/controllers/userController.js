const mongoose = require("mongoose");
const User = require("../models/User");
const Exercise = require("../models/Exercise");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/users/me
 * Get current user profile. For patients, includes their assignedExercises array.
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "NOT_FOUND"
      });
    }

    const responseData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    if (user.role === "PATIENT") {
      responseData.assignedExercises = (user.assignedExercises || []).map((a) => ({
        id: a._id.toString(),
        exerciseId: a.exerciseId ? a.exerciseId.toString() : null,
        assignedBy: a.assignedBy ? a.assignedBy.toString() : null,
        assignedAt: a.assignedAt,
        dueDate: a.dueDate,
        targetSets: a.targetSets,
        targetReps: a.targetReps,
        targetDurationSeconds: a.targetDurationSeconds,
        frequency: a.frequency,
        status: a.status,
        therapistNotes: a.therapistNotes
      }));
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * PUT /api/users/me
 * Update user's non-sensitive profile (name only).
 * Users cannot modify role, email, password, assignedExercises, or therapistNotes.
 */
const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid name is required",
        error: "BAD_REQUEST"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "NOT_FOUND"
      });
    }

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * GET /api/users/patients
 * List all patient accounts managed by therapists (Therapist Only).
 * Optional query parameter: ?search=
 */
const getPatients = async (req, res) => {
  try {
    const { search } = req.query || {};
    const query = { role: "PATIENT" };

    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const patients = await User.find(query).sort({ createdAt: -1 });

    const formatted = patients.map((patient) => {
      const activeAssignments = (patient.assignedExercises || []).filter(
        (a) => a.status === "active"
      ).length;

      return {
        id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        activeAssignmentsCount: activeAssignments,
        createdAt: patient.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patients",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * GET /api/users/patients/:id
 * Get detailed patient record (Therapist Only).
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Patient ID not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        role: patient.role,
        assignedExercises: (patient.assignedExercises || []).map((a) => ({
          id: a._id.toString(),
          exerciseId: a.exerciseId ? a.exerciseId.toString() : null,
          assignedBy: a.assignedBy ? a.assignedBy.toString() : null,
          assignedAt: a.assignedAt,
          dueDate: a.dueDate,
          targetSets: a.targetSets,
          targetReps: a.targetReps,
          targetDurationSeconds: a.targetDurationSeconds,
          frequency: a.frequency,
          status: a.status,
          therapistNotes: a.therapistNotes
        })),
        therapistNotes: (patient.therapistNotes || []).map((n) => ({
          id: n._id.toString(),
          therapistId: n.therapistId ? n.therapistId.toString() : null,
          note: n.note,
          createdAt: n.createdAt
        })),
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patient record",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * POST /api/users/patients/:id/assignments
 * Assign exercise to patient subdocument (Therapist Only).
 */
const assignExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const {
      exerciseId,
      targetSets,
      targetReps,
      targetDurationSeconds,
      frequency,
      dueDate,
      therapistNotes
    } = req.body || {};

    if (!exerciseId || !isValidObjectId(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "A valid exerciseId is required",
        error: "BAD_REQUEST"
      });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Referenced exercise not found.",
        error: "NOT_FOUND"
      });
    }

    if (targetSets === undefined || typeof targetSets !== "number" || targetSets <= 0) {
      return res.status(400).json({
        success: false,
        message: "targetSets is required and must be a positive number",
        error: "BAD_REQUEST"
      });
    }

    const newAssignment = {
      exerciseId: exercise._id,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      targetSets,
      targetReps: typeof targetReps === "number" ? targetReps : null,
      targetDurationSeconds: typeof targetDurationSeconds === "number" ? targetDurationSeconds : null,
      frequency: typeof frequency === "string" ? frequency.trim() : null,
      status: "active",
      therapistNotes: typeof therapistNotes === "string" ? therapistNotes.trim() : null
    };

    patient.assignedExercises.push(newAssignment);
    await patient.save();

    const createdAssignment = patient.assignedExercises[patient.assignedExercises.length - 1];

    return res.status(201).json({
      success: true,
      message: "Exercise assigned successfully",
      data: {
        id: createdAssignment._id.toString(),
        exerciseId: createdAssignment.exerciseId.toString(),
        assignedBy: createdAssignment.assignedBy.toString(),
        assignedAt: createdAssignment.assignedAt,
        dueDate: createdAssignment.dueDate,
        targetSets: createdAssignment.targetSets,
        targetReps: createdAssignment.targetReps,
        targetDurationSeconds: createdAssignment.targetDurationSeconds,
        frequency: createdAssignment.frequency,
        status: createdAssignment.status,
        therapistNotes: createdAssignment.therapistNotes
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign exercise",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * PUT /api/users/patients/:id/assignments/:assignmentId
 * Update assignment subdocument (Patient or Therapist).
 * Patient can ONLY update status on their own assignment.
 * Therapist can update targets, dueDate, frequency, status, notes.
 */
const updateAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(assignmentId)) {
      return res.status(404).json({
        success: false,
        message: "Assignment or patient not found.",
        error: "NOT_FOUND"
      });
    }

    // Role and ownership check
    const isPatient = req.user.role === "PATIENT";
    const isTherapist = req.user.role === "THERAPIST";

    if (isPatient && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to access this resource.",
        error: "FORBIDDEN"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const assignment = patient.assignedExercises.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
        error: "NOT_FOUND"
      });
    }

    const {
      status,
      targetSets,
      targetReps,
      targetDurationSeconds,
      dueDate,
      frequency,
      therapistNotes
    } = req.body || {};

    const allowedStatuses = ["active", "completed", "paused", "cancelled"];

    if (isPatient) {
      // Patients are forbidden from modifying clinical assignment targets
      if (
        targetSets !== undefined ||
        targetReps !== undefined ||
        targetDurationSeconds !== undefined ||
        dueDate !== undefined ||
        frequency !== undefined ||
        therapistNotes !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: "Patients cannot modify clinical assignment targets.",
          error: "FORBIDDEN"
        });
      }

      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
          error: "BAD_REQUEST"
        });
      }

      assignment.status = status;
    } else if (isTherapist) {
      if (status !== undefined) {
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Status must be one of: ${allowedStatuses.join(", ")}`,
            error: "BAD_REQUEST"
          });
        }
        assignment.status = status;
      }
      if (targetSets !== undefined) {
        if (typeof targetSets !== "number" || targetSets <= 0) {
          return res.status(400).json({
            success: false,
            message: "targetSets must be a positive number",
            error: "BAD_REQUEST"
          });
        }
        assignment.targetSets = targetSets;
      }
      if (targetReps !== undefined) {
        assignment.targetReps = typeof targetReps === "number" ? targetReps : null;
      }
      if (targetDurationSeconds !== undefined) {
        assignment.targetDurationSeconds = typeof targetDurationSeconds === "number" ? targetDurationSeconds : null;
      }
      if (dueDate !== undefined) {
        assignment.dueDate = dueDate ? new Date(dueDate) : null;
      }
      if (frequency !== undefined) {
        assignment.frequency = typeof frequency === "string" ? frequency.trim() : null;
      }
      if (therapistNotes !== undefined) {
        assignment.therapistNotes = typeof therapistNotes === "string" ? therapistNotes.trim() : null;
      }
    }

    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: {
        id: assignment._id.toString(),
        exerciseId: assignment.exerciseId.toString(),
        status: assignment.status,
        targetSets: assignment.targetSets,
        targetReps: assignment.targetReps,
        targetDurationSeconds: assignment.targetDurationSeconds,
        dueDate: assignment.dueDate,
        frequency: assignment.frequency,
        therapistNotes: assignment.therapistNotes
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update assignment",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * DELETE /api/users/patients/:id/assignments/:assignmentId
 * Remove assignment subdocument (Therapist Only).
 */
const deleteAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(assignmentId)) {
      return res.status(404).json({
        success: false,
        message: "Assignment or patient not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const assignment = patient.assignedExercises.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
        error: "NOT_FOUND"
      });
    }

    assignment.deleteOne();
    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Assignment removed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove assignment",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * POST /api/users/patients/:id/notes
 * Add clinical note to patient (Therapist Only).
 */
const addNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const { note } = req.body || {};

    if (!note || typeof note !== "string" || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Clinical note content is required.",
        error: "BAD_REQUEST"
      });
    }

    const newNote = {
      therapistId: req.user.id,
      note: note.trim(),
      createdAt: new Date()
    };

    patient.therapistNotes.push(newNote);
    await patient.save();

    const createdNote = patient.therapistNotes[patient.therapistNotes.length - 1];

    return res.status(201).json({
      success: true,
      message: "Therapist note recorded",
      data: {
        id: createdNote._id.toString(),
        therapistId: createdNote.therapistId.toString(),
        note: createdNote.note,
        createdAt: createdNote.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to record therapist note",
      error: "SERVER_ERROR"
    });
  }
};

/**
 * GET /api/users/patients/:id/notes
 * Get clinical notes recorded for patient (Therapist Only).
 */
const getNotes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findOne({ _id: id, role: "PATIENT" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
        error: "NOT_FOUND"
      });
    }

    const formatted = (patient.therapistNotes || []).map((n) => ({
      id: n._id.toString(),
      therapistId: n.therapistId ? n.therapistId.toString() : null,
      note: n.note,
      createdAt: n.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve clinical notes",
      error: "SERVER_ERROR"
    });
  }
};

module.exports = {
  getMe,
  updateMe,
  getPatients,
  getPatientById,
  assignExercise,
  updateAssignment,
  deleteAssignment,
  addNote,
  getNotes
};
