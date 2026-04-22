const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin } = require("../controllers/adminAuthController");

router.post("/login", adminLogin);

// /* ⚠️ TEMPORARY — sirf 1 baar admin banane ke liye */
// router.post("/create-admin", createAdmin);

module.exports = router;
