const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const sharedDir = path.join(__dirname, "../uploads/shared");
if (!fs.existsSync(sharedDir)) {
  fs.mkdirSync(sharedDir, { recursive: true });
}

// Configure storage for shared files
const sharedStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, sharedDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for shared files
const sharedFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, TXT, and images are allowed."), false);
  }
};

// Multer instance for shared files
const uploadSharedFile = multer({
  storage: sharedStorage,
  fileFilter: sharedFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = {
  uploadSharedFile
};