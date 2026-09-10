const express = require("express");
const router = express.Router();
const JobApplication = require("../models/JobApplication");
const Resume = require("../models/Resume");
const { authenticateToken } = require("./auth");
const { calculateAtsScore } = require("../utils/atsScorer");

// GET /api/analytics/stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Query counts for current user if available, or general count
    const filter = userId ? { userId } : {};
    
    const [jobsCount, userResumes, interviewJobs] = await Promise.all([
      JobApplication.countDocuments(filter).catch(() => 0),
      Resume.find(filter).lean().catch(() => []),
      JobApplication.countDocuments({
        ...filter,
        status: { $regex: /interview/i },
      }).catch(() => 0),
    ]);

    const resumesCount = userResumes.length;
    let averageAtsScore = 0;
    if (resumesCount > 0) {
      const totalScore = userResumes.reduce((acc, r) => acc + calculateAtsScore(r).score, 0);
      averageAtsScore = Math.round(totalScore / resumesCount);
    } else {
      averageAtsScore = 0;
    }

    const conversionRate = jobsCount > 0 
      ? Math.round((interviewJobs / jobsCount) * 100) 
      : 0;

    res.json({
      jobsAdded: jobsCount,
      resumesCreated: resumesCount,
      interviews: interviewJobs,
      conversionRate,
      averageAtsScore,
    });
  } catch (err) {
    console.error("Analytics stats error:", err);
    res.status(500).json({ message: "Error calculating analytics stats" });
  }
});

module.exports = router;
