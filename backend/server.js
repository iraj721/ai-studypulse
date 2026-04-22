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

// ✅ Socket.IO with proper CORS
const io = new Server(server, { 
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true 
  } 
});

/* =========================
   MIDDLEWARE
========================= */
// ✅ Security headers
app.use(helmet());

// ✅ CORS - restrict to frontend only
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true 
}));

app.use(express.json());

// ✅ Rate limiting - prevent abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes per IP
  message: { message: "Too many requests, please try again later." },
  skipSuccessfulRequests: false,
});
app.use("/api/", globalLimiter);

// Stricter limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: { message: "Too many AI requests. Please wait a moment." },
});
app.use("/api/chat", aiLimiter);
app.use("/api/quizzes/generate", aiLimiter);

/* =========================
   UPLOADS
========================= */
const uploadsPath = path.join(__dirname, "uploads");
["assignments", "submissions", "materials"].forEach((dir) => {
  const full = path.join(uploadsPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});
app.use("/uploads", express.static(uploadsPath));

/* =========================
   DATABASE
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

app.get("/", (req, res) => res.send("API Running"));

// ✅ Error handling middleware (catch all)
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

app.locals.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));