require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const exerciseRoutes = require("./routes/exerciseRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELTRIX API is running"
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// User Routes
app.use("/api/users", userRoutes);

// Exercise Routes
app.use("/api/exercises", exerciseRoutes);

// Exercise Session Routes
app.use("/api/sessions", sessionRoutes);

// Patient Routes (Progress)
app.use("/api/patients", patientRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: "NOT_FOUND"
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: "SERVER_ERROR"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`VELTRIX server running on port ${PORT}`);
  });
};

startServer();