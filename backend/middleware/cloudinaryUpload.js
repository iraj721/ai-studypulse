const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

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

module.exports = {
  assignments: multer({ storage: assignmentsStorage }),
  materials: multer({ storage: materialsStorage }),
};
