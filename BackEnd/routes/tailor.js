const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const { generateJson } = require("../models/openrouter");
const { authenticateToken } = require("./auth");

const tailorSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description:
              "The section the text belongs to (e.g. work, summary, skills)",
          },
          current: {
            type: "string",
            description:
              "The exact verbatim text currently in the resume that needs changing",
          },
          suggested: {
            type: "string",
            description: "The suggested replacement text",
          },
          reason: {
            type: "string",
            description:
              "Why this change is suggested based on the job description",
          },
        },
        required: ["section", "current", "suggested", "reason"],
      },
    },
  },
  required: ["suggestions"],
};

function getUserId(req) {
  return (
    req.user?.id ||
    req.userId ||
    req.auth?.id ||
    req.headers["x-user-id"] ||
    null
  );
}

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res
        .status(400)
        .json({ message: "Missing resumeId or jobDescription" });
    }

    const uid = getUserId(req);
    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: uid });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const system = [
      "You are an expert resume reviewer and career coach.",
      "Compare the provided resume data with the job description.",
      "Provide specific suggestions to tailor the resume to the job description.",
      'Output a JSON object with a "suggestions" array.',
      "Each suggestion MUST identify the `section`, the EXACT `current` text from the resume (must be a verbatim match of a whole sentence or bullet point, do not truncate or summarize it), the `suggested` replacement text, and a `reason`.",
    ].join(" ");

    const json = await generateJson({
      system,
      user: {
        jobDescription,
        resumeData: { basics: resume.basics, blocks: resume.blocks },
      },
      schema: tailorSchema,
    });

    return res.json({
      suggestions: Array.isArray(json?.suggestions) ? json.suggestions : [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
