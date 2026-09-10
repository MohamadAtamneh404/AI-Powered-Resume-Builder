const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Resume = require("../models/Resume");
const { authenticateToken } = require("./auth");
const validate = require("../middlewares/validate");

// Helper: Ensure user has valid default preferences, subscription, and usage
function ensureUserDefaults(user) {
  let modified = false;

  if (!user.preferences) {
    user.preferences = {};
    modified = true;
  }
  if (!user.preferences.ats) {
    user.preferences.ats = {
      strictSingleColumn: true,
      dateFormat: "YYYY-MM",
      exportEngine: "puppeteer",
      embedAtsJson: true,
    };
    modified = true;
  }
  if (!user.preferences.copilot) {
    user.preferences.copilot = {
      tone: "metrics",
      keywordDensity: 85,
      aiModel: "gemini-pro",
    };
    modified = true;
  }
  if (!user.subscription) {
    user.subscription = {
      tier: "pro",
      status: "active",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    modified = true;
  }
  if (!user.usage) {
    user.usage = {
      aiRewrites: 0,
      atsScans: 0,
      billingCycleStart: new Date(),
    };
    modified = true;
  }

  // Check 30-day billing cycle auto-reset
  const cycleStart = new Date(user.usage.billingCycleStart || Date.now());
  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (now - cycleStart >= thirtyDaysMs) {
    user.usage.aiRewrites = 0;
    user.usage.atsScans = 0;
    user.usage.billingCycleStart = now;
    user.subscription.renewalDate = new Date(now.getTime() + thirtyDaysMs);
    modified = true;
  }

  return modified;
}

// GET user profile and complete settings/telemetry
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const modified = ensureUserDefaults(user);
    if (modified) {
      await user.save();
    }

    const activeResumes = await Resume.countDocuments({
      $or: [{ userId }, { user: userId }],
    });

    const userObj = user.toObject();
    userObj.usage = {
      ...userObj.usage,
      activeResumes,
    };

    res.json(userObj);
  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ message: "Failed to load user profile." });
  }
});

// GET dedicated settings & telemetry
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const modified = ensureUserDefaults(user);
    if (modified) {
      await user.save();
    }

    const activeResumes = await Resume.countDocuments({
      $or: [{ userId }, { user: userId }],
    });

    res.json({
      preferences: user.preferences,
      subscription: user.subscription,
      usage: {
        aiRewrites: user.usage?.aiRewrites || 0,
        atsScans: user.usage?.atsScans || 0,
        activeResumes,
        billingCycleStart: user.usage?.billingCycleStart,
      },
    });
  } catch (err) {
    console.error("GET /settings error:", err);
    res.status(500).json({ message: "Failed to load settings." });
  }
});

// PUT update user profile (Personal Info & Password)
router.put(
  "/profile",
  authenticateToken,
  validate({
    fullName: "string?",
    photo: "string?",
    currentPassword: "string?",
    newPassword: "string?",
    confirmPassword: "string?",
  }),
  async (req, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const { fullName, photo, currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (fullName !== undefined) user.fullName = fullName;
      if (photo !== undefined) user.photo = photo;

      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      ensureUserDefaults(user);
      await user.save();

      const activeResumes = await Resume.countDocuments({
        $or: [{ userId }, { user: userId }],
      });

      const userObj = user.toObject();
      delete userObj.password;
      userObj.usage = {
        ...userObj.usage,
        activeResumes,
      };

      res.json({
        message: "Profile updated successfully",
        user: userObj,
      });
    } catch (err) {
      console.error("PUT /profile error:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  },
);

// PUT update preferences (ATS and AI Copilot Tuning)
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { ats, copilot } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    ensureUserDefaults(user);

    if (ats && typeof ats === "object") {
      if (typeof ats.strictSingleColumn === "boolean") {
        user.preferences.ats.strictSingleColumn = ats.strictSingleColumn;
      }
      if (typeof ats.dateFormat === "string") {
        user.preferences.ats.dateFormat = ats.dateFormat;
      }
      if (typeof ats.exportEngine === "string") {
        user.preferences.ats.exportEngine = ats.exportEngine;
      }
      if (typeof ats.embedAtsJson === "boolean") {
        user.preferences.ats.embedAtsJson = ats.embedAtsJson;
      }
    }

    if (copilot && typeof copilot === "object") {
      if (["metrics", "direct", "executive"].includes(copilot.tone)) {
        user.preferences.copilot.tone = copilot.tone;
      }
      if (typeof copilot.keywordDensity === "number") {
        user.preferences.copilot.keywordDensity = Math.min(
          98,
          Math.max(65, copilot.keywordDensity),
        );
      }
      if (["gemini-pro", "gpt-4o"].includes(copilot.aiModel)) {
        user.preferences.copilot.aiModel = copilot.aiModel;
      }
    }

    user.markModified("preferences");
    await user.save();

    const activeResumes = await Resume.countDocuments({
      $or: [{ userId }, { user: userId }],
    });

    const userObj = user.toObject();
    delete userObj.password;
    userObj.usage = {
      ...userObj.usage,
      activeResumes,
    };

    res.json({
      message: "Preferences saved successfully",
      preferences: user.preferences,
      user: userObj,
    });
  } catch (err) {
    console.error("PUT /settings error:", err);
    res.status(500).json({ message: "Failed to save preferences." });
  }
});

// POST update subscription tier or reset monthly telemetry quota
router.post("/subscription", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { action, tier } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    ensureUserDefaults(user);

    if (tier && ["free", "pro"].includes(tier)) {
      user.subscription.tier = tier;
    }

    if (action === "reset_quota") {
      user.usage.aiRewrites = 0;
      user.usage.atsScans = 0;
      user.usage.billingCycleStart = new Date();
      user.subscription.renewalDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      );
    }

    user.markModified("subscription");
    user.markModified("usage");
    await user.save();

    const activeResumes = await Resume.countDocuments({
      $or: [{ userId }, { user: userId }],
    });

    const userObj = user.toObject();
    delete userObj.password;
    userObj.usage = {
      ...userObj.usage,
      activeResumes,
    };

    res.json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
      usage: userObj.usage,
      user: userObj,
    });
  } catch (err) {
    console.error("POST /subscription error:", err);
    res.status(500).json({ message: "Failed to update subscription." });
  }
});

module.exports = router;
