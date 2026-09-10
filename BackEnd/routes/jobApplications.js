// routes/jobApplications.js
const express = require("express");
const JobApplication = require("../models/JobApplication");
const { authenticateToken } = require("./auth");
const router = express.Router();

// GET all job applications (authenticated)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const jobs = await JobApplication.find({ userId: req.userId }).sort({
      dateApplied: -1,
    });
    res.json(jobs);
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [jobsAdded, totalApplied, interviews] = await Promise.all([
      JobApplication.countDocuments({
        userId: req.userId,
        createdAt: { $gte: sevenDaysAgo },
        archived: false,
      }),
      JobApplication.countDocuments({
        userId: req.userId,
        archived: false,
      }),
      JobApplication.countDocuments({
        userId: req.userId,
        status: "Interview",
        archived: false,
      }),
    ]);

    const conversionRate =
      totalApplied > 0 ? Math.round((interviews / totalApplied) * 100) : 0;

    res.json({ jobsAdded, conversionRate });
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single job
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

const validate = require("../middlewares/validate");

// CREATE new job application
router.post(
  "/",
  authenticateToken,
  validate({ company: "string", position: "string" }),
  async (req, res) => {
    const job = new JobApplication({ ...req.body, userId: req.userId });
    await job.save();
    res.status(201).json(job);
  },
);

// UPDATE job application
router.put(
  "/:id",
  authenticateToken,
  validate({ company: "string", position: "string" }),
  async (req, res) => {
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  },
);

// DELETE job application
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk archive/delete
router.post("/bulk", authenticateToken, async (req, res) => {
  const { action, jobIds } = req.body;
  try {
    if (action === "archive") {
      await JobApplication.updateMany(
        { _id: { $in: jobIds }, userId: req.userId },
        { archived: true },
      );
    } else if (action === "delete") {
      await JobApplication.deleteMany({
        _id: { $in: jobIds },
        userId: req.userId,
      });
    }
    res.json({ success: true });
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

// Archive a single job
router.patch("/:id/archive", authenticateToken, async (req, res) => {
  try {
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { archived: true },
      { new: true },
    );
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  } catch (_err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
