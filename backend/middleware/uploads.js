const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/* =========================
   ASSIGNMENTS (Teacher)
========================= */
ensureDir("uploads/assignments");

const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadAssignment = multer({ storage: assignmentStorage });

/* =========================
   SUBMISSIONS (Student)
========================= */
ensureDir("uploads/submissions");

const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/submissions");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadSubmission = multer({ storage: submissionStorage });

module.exports = {
  uploadAssignment,
  uploadSubmission,
};
