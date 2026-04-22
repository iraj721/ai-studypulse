const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/insights", authMiddleware, dashboardController.getInsights);
router.post("/insights", authMiddleware, dashboardController.createInsight);
router.get("/insights/export/pdf", authMiddleware, dashboardController.exportInsightsPDF);

module.exports = router;
