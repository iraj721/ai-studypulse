require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* =========================
   SOCKET
========================= */
io.on("connection", (socket) => {
  socket.on("joinUserRoom", (userId) => socket.join(userId));
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({ origin: "*", allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

/* =========================
   🔥 UPLOADS
========================= */
const uploadsPath = path.join(__dirname, "uploads");
["assignments", "submissions", "materials"].forEach((dir) => {
  const full = path.join(uploadsPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});
app.use("/uploads", express.static(uploadsPath)); // serve files

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((e) => console.error(e));

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

app.locals.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("🚀 Server running on", PORT));
