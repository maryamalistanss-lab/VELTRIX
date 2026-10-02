const ExerciseSession = require("../models/ExerciseSession");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const {
  isValidObjectId,
  validateSessionInput,
  normalizeSessionDifficulty
} = require("../utils/validators");

const forbiddenResponse = (res, message = "Access denied. You do not have permission to access this resource.") => {
  return res.status(403).json({
    success: false,
    message,
    error: "FORBIDDEN"
  });
};

const therapistManagesPatient = async (therapistId, patientId) => {
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== "PATIENT") return false;

  // If patient has assignments, check if assigned by therapist
  if (patient.assignedExercises && patient.assignedExercises.length > 0) {
    const hasAssignmentByTherapist = patient.assignedExercises.some(
      (a) => a.assignedBy && a.assignedBy.toString() === therapistId.toString()
    );
    if (hasAssignmentByTherapist) return true;
  }

  // Check if therapist recorded notes for patient
  if (patient.therapistNotes && patient.therapistNotes.length > 0) {
    const hasNoteByTherapist = patient.therapistNotes.some(
      (n) => n.therapistId && n.therapistId.toString() === therapistId.toString()
    );
    if (hasNoteByTherapist) return true;
  }

  // If no assignments or notes exist yet, therapist can access patient profile and sessions
  return true;
};

const formatSession = (s, exerciseName = null) => {
  const exName =
    exerciseName ||
    (s.exerciseId && typeof s.exerciseId === "object" && s.exerciseId.name) ||
    undefined;

  const exId =
    s.exerciseId && typeof s.exerciseId === "object" && s.exerciseId._id
      ? s.exerciseId._id
      : s.exerciseId;

  return {
    id: s._id,
    patientId: s.patientId,
    exerciseId: exId,
    ...(exName ? { exerciseName: exName } : {}),
    assignmentId: s.assignmentId || null,
    completedAt: s.completedAt,
    date: s.completedAt,
    setsCompleted: s.setsCompleted,
    repsCompleted: s.repsCompleted,
    repetitionsCompleted: s.repsCompleted,
    durationSeconds: s.durationSeconds,
    painBefore: s.painBefore,
    painAfter: s.painAfter,
    perceivedDifficulty: s.perceivedDifficulty,
    difficulty: s.perceivedDifficulty,
    completionStatus: s.completionStatus || "completed",
    notes: s.notes || null,
    sessionResults: s.sessionResults || {},
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  };
};

// POST /api/sessions - Log Completed Exercise Session (Patient Only)
const logSession = async (req, res) => {
  try {
    const validation = validateSessionInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(" "),
        error: "BAD_REQUEST"
      });
    }

    const {
      exerciseId,
      assignmentId,
      completedAt,
      setsCompleted,
      repsCompleted,
      repetitionsCompleted,
      durationSeconds,
      painBefore,
      painAfter,
      perceivedDifficulty,
      difficulty,
      completionStatus,
      notes,
      sessionResults
    } = req.body;

    const exerciseExists = await Exercise.findById(exerciseId);
    if (!exerciseExists) {
      return res.status(404).json({
        success: false,
        message: "Referenced exercise not found.",
        error: "NOT_FOUND"
      });
    }

    // Patient identity strictly derived from authenticated token
    const patientId = req.user.id;

    const finalReps = repsCompleted !== undefined ? repsCompleted : repetitionsCompleted !== undefined ? repetitionsCompleted : null;
    const finalDiff = validation.normalizedDifficulty || normalizeSessionDifficulty(perceivedDifficulty || difficulty) || "moderate";

    const newSession = await ExerciseSession.create({
      patientId,
      exerciseId,
      assignmentId: assignmentId && isValidObjectId(assignmentId) ? assignmentId : null,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      setsCompleted,
      repsCompleted: finalReps,
      durationSeconds: durationSeconds || null,
      painBefore,
      painAfter,
      perceivedDifficulty: finalDiff,
      completionStatus: completionStatus ? completionStatus.toLowerCase() : "completed",
      notes: notes ? notes.trim() : null,
      sessionResults: sessionResults || {}
    });

    return res.status(201).json({
      success: true,
      message: "Exercise session logged successfully",
      data: formatSession(newSession, exerciseExists.name)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to log exercise session.",
      error: "SERVER_ERROR"
    });
  }
};

// PUT / PATCH /api/sessions/:id - Update Existing Session (Patient owns or Therapist manages)
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Session record not found.",
        error: "NOT_FOUND"
      });
    }

    const session = await ExerciseSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session record not found.",
        error: "NOT_FOUND"
      });
    }

    const userRole = (req.user.role || "").toUpperCase();

    // Patient session isolation: Patient can ONLY update their own session
    if (userRole === "PATIENT") {
      if (session.patientId.toString() !== req.user.id) {
        return forbiddenResponse(res, "Access denied. You cannot modify another patient's session.");
      }
    } else if (userRole === "THERAPIST") {
      const managesPatient = await therapistManagesPatient(req.user.id, session.patientId);
      if (!managesPatient) {
        return forbiddenResponse(res);
      }
    }

    const {
      setsCompleted,
      repsCompleted,
      repetitionsCompleted,
      durationSeconds,
      painBefore,
      painAfter,
      perceivedDifficulty,
      difficulty,
      completionStatus,
      notes,
      sessionResults
    } = req.body;

    if (setsCompleted !== undefined) {
      if (typeof setsCompleted !== "number" || isNaN(setsCompleted) || setsCompleted < 0) {
        return res.status(400).json({
          success: false,
          message: "setsCompleted must be a non-negative number.",
          error: "BAD_REQUEST"
        });
      }
      session.setsCompleted = setsCompleted;
    }

    const repsVal = repsCompleted !== undefined ? repsCompleted : repetitionsCompleted;
    if (repsVal !== undefined) {
      if (repsVal !== null && (typeof repsVal !== "number" || isNaN(repsVal) || repsVal < 0)) {
        return res.status(400).json({
          success: false,
          message: "repetitions completed must be a non-negative number.",
          error: "BAD_REQUEST"
        });
      }
      session.repsCompleted = repsVal;
    }

    if (durationSeconds !== undefined) {
      if (durationSeconds !== null && (typeof durationSeconds !== "number" || isNaN(durationSeconds) || durationSeconds < 0)) {
        return res.status(400).json({
          success: false,
          message: "durationSeconds must be a non-negative number.",
          error: "BAD_REQUEST"
        });
      }
      session.durationSeconds = durationSeconds;
    }

    if (painBefore !== undefined) {
      if (typeof painBefore !== "number" || isNaN(painBefore) || painBefore < 0 || painBefore > 10) {
        return res.status(400).json({
          success: false,
          message: "painBefore must be a number between 0 and 10.",
          error: "BAD_REQUEST"
        });
      }
      session.painBefore = painBefore;
    }

    if (painAfter !== undefined) {
      if (typeof painAfter !== "number" || isNaN(painAfter) || painAfter < 0 || painAfter > 10) {
        return res.status(400).json({
          success: false,
          message: "painAfter must be a number between 0 and 10.",
          error: "BAD_REQUEST"
        });
      }
      session.painAfter = painAfter;
    }

    const diffVal = perceivedDifficulty !== undefined ? perceivedDifficulty : difficulty;
    if (diffVal !== undefined) {
      const normalized = normalizeSessionDifficulty(diffVal);
      if (!normalized || !["easy", "moderate", "hard"].includes(normalized)) {
        return res.status(400).json({
          success: false,
          message: "perceivedDifficulty must be one of: easy, moderate, hard.",
          error: "BAD_REQUEST"
        });
      }
      session.perceivedDifficulty = normalized;
    }

    if (completionStatus !== undefined) {
      const validStatuses = ["in-progress", "completed", "paused", "abandoned"];
      if (typeof completionStatus !== "string" || !validStatuses.includes(completionStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "completionStatus must be one of: in-progress, completed, paused, abandoned.",
          error: "BAD_REQUEST"
        });
      }
      session.completionStatus = completionStatus.toLowerCase();
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return res.status(400).json({
          success: false,
          message: "notes must be a string.",
          error: "BAD_REQUEST"
        });
      }
      if (notes && notes.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "notes cannot exceed 1000 characters.",
          error: "BAD_REQUEST"
        });
      }
      session.notes = notes ? notes.trim() : null;
    }

    if (sessionResults !== undefined && typeof sessionResults === "object") {
      session.sessionResults = {
        ...session.sessionResults,
        ...sessionResults
      };
    }

    await session.save();

    const populated = await ExerciseSession.findById(session._id).populate("exerciseId", "name");

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: formatSession(populated)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update session.",
      error: "SERVER_ERROR"
    });
  }
};

// GET /api/sessions - Get Exercise Sessions History
const getSessions = async (req, res) => {
  try {
    const filter = {};
    const { limit, startDate, completionStatus } = req.query;
    const userRole = (req.user.role || "").toUpperCase();

    if (userRole === "PATIENT") {
      // Patient isolation: strictly restricted to authenticated patient's sessions
      filter.patientId = req.user.id;
    } else {
      // Therapist role: can query for all managed patients or specific patient if requested
      if (req.query.patientId && isValidObjectId(req.query.patientId)) {
        filter.patientId = req.query.patientId;
      } else {
        const managedPatients = await User.find({
          "assignedExercises.assignedBy": req.user.id
        }).select("_id");
        if (managedPatients.length > 0) {
          filter.patientId = { $in: managedPatients.map((patient) => patient._id) };
        }
      }
    }

    if (startDate) {
      filter.completedAt = { $gte: new Date(startDate) };
    }

    if (completionStatus) {
      filter.completionStatus = completionStatus.toLowerCase();
    }

    const queryLimit = limit ? parseInt(limit, 10) : 0;
    const query = ExerciseSession.find(filter)
      .populate("exerciseId", "name")
      .sort({ completedAt: -1 });

    if (queryLimit > 0) {
      query.limit(queryLimit);
    }

    const sessions = await query.exec();
    const formattedData = sessions.map((s) => formatSession(s));

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve session history.",
      error: "SERVER_ERROR"
    });
  }
};

// GET /api/sessions/:id - Get Session Details by ID
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Session record not found.",
        error: "NOT_FOUND"
      });
    }

    const session = await ExerciseSession.findById(id).populate("exerciseId", "name");
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session record not found.",
        error: "NOT_FOUND"
      });
    }

    const userRole = (req.user.role || "").toUpperCase();

    if (userRole === "PATIENT") {
      // Patient isolation: cannot view another patient's session
      if (session.patientId.toString() !== req.user.id) {
        return forbiddenResponse(res);
      }
    } else if (userRole === "THERAPIST") {
      const managesPatient = await therapistManagesPatient(req.user.id, session.patientId);
      if (!managesPatient) {
        return forbiddenResponse(res);
      }
    }

    return res.status(200).json({
      success: true,
      data: formatSession(session)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve session details.",
      error: "SERVER_ERROR"
    });
  }
};

// GET /api/sessions/patient/:patientId - Get Specific Patient Session History (Therapist Only)
const getPatientSessions = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!isValidObjectId(patientId)) {
      return res.status(404).json({
        success: false,
        message: "Patient ID not found.",
        error: "NOT_FOUND"
      });
    }

    const patient = await User.findById(patientId).select("_id role");
    if (!patient || patient.role !== "PATIENT") {
      return res.status(404).json({
        success: false,
        message: "Patient ID not found.",
        error: "NOT_FOUND"
      });
    }

    const managesPatient = await therapistManagesPatient(req.user.id, patientId);
    if (!managesPatient) {
      return forbiddenResponse(res);
    }

    const sessions = await ExerciseSession.find({ patientId })
      .populate("exerciseId", "name")
      .sort({ completedAt: -1 });

    const formattedData = sessions.map((s) => formatSession(s));

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve patient session history.",
      error: "SERVER_ERROR"
    });
  }
};

// Progress API: Calculate factual rehabilitation progress from actual ExerciseSession records
const getPatientProgress = async (req, res) => {
  try {
    const userRole = (req.user.role || "").toUpperCase();
    let targetPatientId;

    if (userRole === "PATIENT") {
      const requestedId = req.params.patientId || req.params.id;
      if (requestedId && requestedId.toString() !== req.user.id.toString()) {
        return forbiddenResponse(res, "Access denied. You cannot view another patient's progress.");
      }
      targetPatientId = req.user.id;
    } else if (userRole === "THERAPIST") {
      // Therapists can query a patient's progress
      targetPatientId = req.params.patientId || req.params.id;

      if (!targetPatientId || !isValidObjectId(targetPatientId)) {
        return res.status(404).json({
          success: false,
          message: "Patient ID not found.",
          error: "NOT_FOUND"
        });
      }

      const patient = await User.findById(targetPatientId).select("_id role");
      if (!patient || patient.role !== "PATIENT") {
        return res.status(404).json({
          success: false,
          message: "Patient ID not found.",
          error: "NOT_FOUND"
        });
      }

      const managesPatient = await therapistManagesPatient(req.user.id, targetPatientId);
      if (!managesPatient) {
        return forbiddenResponse(res);
      }
    } else {
      return forbiddenResponse(res);
    }

    const sessions = await ExerciseSession.find({ patientId: targetPatientId })
      .populate("exerciseId", "name")
      .sort({ completedAt: 1 });

    const totalSessions = sessions.length;

    // Handle empty sessions cleanly with zero-data structure
    if (totalSessions === 0) {
      return res.status(200).json({
        success: true,
        data: {
          patientId: targetPatientId,
          totalSessions: 0,
          completedSessions: 0,
          completionRatePercentage: 0,
          averagePainBefore: 0,
          averagePainAfter: 0,
          averagePainReduction: 0,
          painTrend: [],
          difficultyBreakdown: {
            easy: 0,
            moderate: 0,
            hard: 0
          },
          recentSessions: []
        }
      });
    }

    const completedSessions = sessions.filter(
      (s) => s.completionStatus === "completed"
    ).length;

    const completionRatePercentage = Math.round((completedSessions / totalSessions) * 100);

    const sumPainBefore = sessions.reduce((sum, s) => sum + (s.painBefore ?? 0), 0);
    const sumPainAfter = sessions.reduce((sum, s) => sum + (s.painAfter ?? 0), 0);

    const averagePainBefore = Number((sumPainBefore / totalSessions).toFixed(1));
    const averagePainAfter = Number((sumPainAfter / totalSessions).toFixed(1));
    const averagePainReduction = Number((averagePainBefore - averagePainAfter).toFixed(1));

    const difficultyBreakdown = {
      easy: 0,
      moderate: 0,
      hard: 0
    };

    sessions.forEach((s) => {
      const diff = s.perceivedDifficulty ? s.perceivedDifficulty.toLowerCase() : "moderate";
      if (difficultyBreakdown[diff] !== undefined) {
        difficultyBreakdown[diff] += 1;
      }
    });

    const painTrend = sessions.map((s) => ({
      sessionId: s._id,
      date: s.completedAt,
      exerciseName: (s.exerciseId && s.exerciseId.name) || "Exercise",
      painBefore: s.painBefore,
      painAfter: s.painAfter,
      painDelta: s.painAfter - s.painBefore,
      difficulty: s.perceivedDifficulty
    }));

    // Recent sessions (newest first, up to 10)
    const recentSessions = [...sessions]
      .reverse()
      .slice(0, 10)
      .map((s) => formatSession(s));

    return res.status(200).json({
      success: true,
      data: {
        patientId: targetPatientId,
        totalSessions,
        completedSessions,
        completionRatePercentage,
        averagePainBefore,
        averagePainAfter,
        averagePainReduction,
        painTrend,
        difficultyBreakdown,
        recentSessions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve progress data.",
      error: "SERVER_ERROR"
    });
  }
};

module.exports = {
  logSession,
  updateSession,
  getSessions,
  getSessionById,
  getPatientSessions,
  getPatientProgress
};
