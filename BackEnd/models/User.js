const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerificationCode: { type: String },
    emailVerified: { type: Boolean, default: false },
    // Optional base64 or URL for user avatar
    photo: { type: String },
    // Optional gender for default avatar fallback
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    preferences: {
      ats: {
        strictSingleColumn: { type: Boolean, default: true },
        dateFormat: { type: String, default: "YYYY-MM" },
        exportEngine: { type: String, default: "puppeteer" },
        embedAtsJson: { type: Boolean, default: true },
      },
      copilot: {
        tone: {
          type: String,
          enum: ["metrics", "direct", "executive"],
          default: "metrics",
        },
        keywordDensity: { type: Number, default: 85 },
        aiModel: {
          type: String,
          enum: ["gemini-pro", "gpt-4o"],
          default: "gemini-pro",
        },
      },
    },
    subscription: {
      tier: { type: String, enum: ["free", "pro"], default: "pro" },
      status: { type: String, default: "active" },
      renewalDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    usage: {
      aiRewrites: { type: Number, default: 0 },
      atsScans: { type: Number, default: 0 },
      billingCycleStart: { type: Date, default: Date.now },
    },
    careerProfile: {
      targetRole: { type: String, default: "" },
      seniority: { type: String, default: "" },
      bio: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
      skills: [{ type: String }],
      experiences: [
        {
          company: { type: String, default: "" },
          position: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          highlights: [{ type: String }],
        },
      ],
      education: [
        {
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      projects: [
        {
          name: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: [{ type: String }],
          url: { type: String, default: "" },
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
