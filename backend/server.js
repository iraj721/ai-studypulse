require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Routes
const authRoutes = require("./routes/auth");
const activitiesRoutes = require("./routes/activities");
const quizzesRoutes = require("./routes/quizzes");
const chatRoutes = require("./routes/chat");
const notesRoutes = require("./routes/notes");
const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/admin");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");

// ✅ Validate required environment variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'EMAIL_USER', 'EMAIL_PASS'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env: ${key}`);
    process.exit(1);
  }
});

const app = express();
const server = http.createServer(app);

/* =========================
   CORS CONFIGURATION - PRODUCTION READY
========================= */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://ai-studypulse.vercel.app',
  'https://ai-studypulse.vercel.app/',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

// Apply CORS middleware - this automatically handles OPTIONS preflight
app.use(cors(corsOptions));

// ✅ Socket.IO configuration
const io = new Server(server, { 
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  }
});

/* =========================
   OTHER MIDDLEWARE
========================= */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.use(express.json());

/* =========================
   RATE LIMITING
========================= */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many AI requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/chat", aiLimiter);
app.use("/api/quizzes/generate", aiLimiter);

/* =========================
   UPLOADS STATIC FILES
========================= */
const uploadsPath = path.join(__dirname, "uploads");
const uploadDirs = ["assignments", "submissions", "materials"];
uploadDirs.forEach((dir) => {
  const full = path.join(uploadsPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});
app.use("/uploads", express.static(uploadsPath));

/* =========================
   DATABASE CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

// Health check endpoint
app.get("/", (req, res) => res.json({ message: "API Running", status: "ok" }));

// Debug endpoint
app.get("/api/debug/cors", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins
  });
});

/* =========================
   ERROR HANDLING
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

app.locals.io = io;

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});