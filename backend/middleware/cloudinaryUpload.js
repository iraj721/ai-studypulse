const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed.'), false);
  }
};

// Teacher assignments storage
const assignmentsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "assignments_submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// Materials storage
const materialsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "materials",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// ✅ Student submissions storage - ADD THIS
const studentSubmissionStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "student_submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// Notes/study materials storage
const notesStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "study_materials",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const uploadConfig = {
  storage: assignmentsStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
};

const uploadMaterialConfig = {
  storage: materialsStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
};

const studentSubmissionConfig = {
  storage: studentSubmissionStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
};

module.exports = {
  assignments: multer(uploadConfig),
  materials: multer(uploadMaterialConfig),
  uploadStudyMaterial: multer({ 
    storage: notesStorage, 
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: fileFilter 
  }),
  studentSubmission: multer(studentSubmissionConfig),
};