const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");  // ✅ config folder se require karo

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed.'), false);
  }
};

const assignmentsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "assignments_submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const materialsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "materials",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// Add file size limit (5MB)
const uploadConfig = {
  storage: assignmentsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
};

const uploadMaterialConfig = {
  storage: materialsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
};

const notesStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "study_materials",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

module.exports = {
  assignments: multer(uploadConfig),
  materials: multer(uploadMaterialConfig),
    uploadStudyMaterial: multer({ 
    storage: notesStorage, 
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter 
  })
};