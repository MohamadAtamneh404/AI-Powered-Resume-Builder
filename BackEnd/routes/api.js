const express = require("express");
const authRoutes = require("./auth.js");
const resumeRoutes = require("./resumeData.js");
const templateRoutes = require("./templates.js");
const jobApplicationRoutes = require("./jobApplications.js");
const aiRoutes = require("./AI-Route.js");
const settingsRoutes = require("./settings.js");
const tailorRoutes = require("./tailor.js");
const analyticsRoutes = require("./analytics.js");

const router = express.Router();

router.use("/users", authRoutes);
router.use("/user", settingsRoutes);
router.use("/settings", settingsRoutes);
router.use("/resumes", resumeRoutes);
router.use("/templates", templateRoutes);
router.use("/jobs", jobApplicationRoutes);
router.use("/ai", aiRoutes);
router.use("/tailor", tailorRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
