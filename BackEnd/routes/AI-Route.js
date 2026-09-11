"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
let pdfParse = null;
try {
  pdfParse = require("pdf-parse");
} catch (e) {
  console.warn("pdf-parse not loaded:", e.message);
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const { generateJson } = require("../models/openrouter");
const { authenticateToken, optionalAuthenticateToken } = require("./auth");
const { calculateAtsScore } = require("../utils/atsScorer");
const User = require("../models/User");

// Gemini-compatible schemas (subset of JSON Schema; avoid unsupported fields)

const summarySchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "1–3 sentence professional summary",
    },
  },
  required: ["summary"],
};

const workBulletsSchema = {
  type: "object",
  properties: {
    highlights: {
      type: "array",
      items: { type: "string" },
      description:
        "2–4 quantified, high-impact bullet points emphasizing achievements and action verbs",
    },
    summary: {
      type: "string",
      description: "Optional 1–2 sentence overview of the role",
    },
  },
  required: ["highlights"],
};

const educationItemSchema = {
  type: "object",
  properties: {
    institution: { type: "string" },
    studyType: {
      type: "string",
      description: "Degree obtained (e.g. B.S., M.A.)",
    },
    area: { type: "string", description: "Field of study" },
    startDate: { type: "string" },
    endDate: { type: "string" },
    score: { type: "string" },
    summary: { type: "string" },
    courses: { type: "array", items: { type: "string" } },
  },
  required: ["institution", "studyType"],
};

const educationSchema = {
  type: "object",
  properties: {
    education: { type: "array", items: educationItemSchema },
  },
  required: ["education"],
};

const fullResumeSchema = {
  type: "object",
  properties: {
    resumeData: {
      type: "object",
      properties: {
        basics: {
          type: "object",
          properties: {
            name: { type: "string" },
            label: { type: "string", description: "Professional title" },
            email: { type: "string" },
            phone: { type: "string" },
            url: { type: "string" },
            summary: { type: "string" },
            location: {
              type: "object",
              properties: {
                city: { type: "string" },
                region: { type: "string" },
                countryCode: { type: "string" },
              },
            },
            profiles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  network: { type: "string" },
                  username: { type: "string" },
                  url: { type: "string" },
                },
              },
            },
          },
          required: ["name", "label", "summary"],
        },
        work: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              position: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              summary: { type: "string" },
              highlights: { type: "array", items: { type: "string" } },
            },
            required: ["company", "position", "highlights"],
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string" },
              studyType: { type: "string" },
              area: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              score: { type: "string" },
              summary: { type: "string" },
            },
            required: ["institution", "studyType"],
          },
        },
        skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Skill category e.g. Languages, Frameworks, Tools",
              },
              level: { type: "string" },
              keywords: { type: "array", items: { type: "string" } },
            },
            required: ["name", "keywords"],
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              url: { type: "string" },
              technologies: { type: "array", items: { type: "string" } },
            },
            required: ["name", "description"],
          },
        },
        awards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              awarder: { type: "string" },
              summary: { type: "string" },
            },
          },
        },
        volunteer: {
          type: "array",
          items: {
            type: "object",
            properties: {
              organization: { type: "string" },
              position: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              summary: { type: "string" },
            },
          },
        },
        publications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              publisher: { type: "string" },
              releaseDate: { type: "string" },
              url: { type: "string" },
              summary: { type: "string" },
            },
          },
        },
        languages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              language: { type: "string" },
              fluency: { type: "string" },
            },
          },
        },
        interests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              keywords: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      required: ["basics", "work", "education", "skills"],
    },
  },
  required: ["resumeData"],
};

const careerBaselineSchema = {
  type: "object",
  properties: {
    fullName: { type: "string", description: "Candidate's full name" },
    targetRole: { type: "string", description: "Target role or professional title" },
    seniority: {
      type: "string",
      description: "Career Seniority Level: Must strictly be one of: 'Entry / Associate (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Staff / Principal (8+ yrs)', 'Director / Executive'",
    },
    bio: { type: "string", description: "2-3 sentence executive professional career bio" },
    phone: { type: "string", description: "Direct contact phone number" },
    location: { type: "string", description: "Location e.g. City, State or City, Country" },
    linkedin: { type: "string", description: "LinkedIn profile URL or handle" },
    github: { type: "string", description: "GitHub profile URL or handle" },
    website: { type: "string", description: "Portfolio or personal website URL" },
    skills: { type: "array", items: { type: "string" } },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          position: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
        },
        required: ["company", "position", "highlights"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["institution", "degree"],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project title or app name" },
          description: { type: "string", description: "Overview of what the project does and impact" },
          technologies: { type: "array", items: { type: "string" }, description: "Tech stack used" },
          url: { type: "string", description: "Link to live demo or GitHub repo" },
        },
        required: ["name"],
      },
    },
  },
  required: ["targetRole", "bio", "skills", "experiences"],
};

// Helpers

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function normalizeResumeData(data = {}) {
  const empty = {
    basics: {
      name: "",
      label: "",
      email: "",
      phone: "",
      url: "",
      summary: "",
      location: {
        address: "",
        postalCode: "",
        city: "",
        countryCode: "",
        region: "",
      },
      profiles: [{ network: "", username: "", url: "" }],
    },
    work: [],
    education: [],
    skills: [],
    awards: [],
    publications: [],
    volunteer: [],
    references: [],
    projects: [],
    interests: [],
    languages: [],
  };

  const rawBasics = data.basics || data.personalInfo || {};
  let location = empty.basics.location;
  if (typeof rawBasics.location === "string") {
    location = { ...empty.basics.location, city: rawBasics.location };
  } else if (rawBasics.location && typeof rawBasics.location === "object") {
    location = { ...empty.basics.location, ...rawBasics.location };
  }

  const merged = { ...empty, ...data };
  merged.basics = {
    ...empty.basics,
    ...rawBasics,
    label: rawBasics.label || rawBasics.title || empty.basics.label,
    location,
    profiles: Array.isArray(rawBasics.profiles)
      ? rawBasics.profiles
      : empty.basics.profiles,
  };

  // Normalize work entries
  const rawWork =
    Array.isArray(merged.work) && merged.work.length
      ? merged.work
      : Array.isArray(merged.experience)
        ? merged.experience
        : [];
  merged.work = rawWork.map((w) => ({
    company: w.company || w.name || "",
    position: w.position || w.title || "",
    startDate: w.startDate || "",
    endDate: w.endDate || "",
    summary: w.summary || "",
    highlights: Array.isArray(w.highlights)
      ? w.highlights
      : Array.isArray(w.description)
        ? w.description
        : typeof w.summary === "string" && w.summary.includes("\n")
          ? w.summary
              .split(/\r?\n|•|- /)
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
  }));

  // Normalize education entries
  merged.education = (
    Array.isArray(merged.education) ? merged.education : []
  ).map((e) => ({
    institution: e.institution || "",
    studyType: e.studyType || e.degree || "",
    area: e.area || "",
    startDate: e.startDate || "",
    endDate: e.endDate || "",
    score: e.score || e.gpa || "",
    summary: e.summary || "",
    courses: Array.isArray(e.courses) ? e.courses : [],
  }));

  // Normalize skills entries
  if (Array.isArray(merged.skills)) {
    if (merged.skills.length > 0 && typeof merged.skills[0] === "string") {
      merged.skills = [
        {
          name: "Technical Skills",
          level: "",
          keywords: merged.skills.filter(Boolean),
        },
      ];
    } else {
      merged.skills = merged.skills.map((s) => ({
        name: typeof s === "object" ? s.name || "General" : "General",
        level: typeof s === "object" ? s.level || "" : "",
        keywords: Array.isArray(s?.keywords)
          ? s.keywords
          : typeof s === "string"
            ? [s]
            : [],
      }));
    }
  } else {
    merged.skills = [];
  }

  // Normalize projects
  merged.projects = (Array.isArray(merged.projects) ? merged.projects : []).map(
    (p) => ({
      name: p.name || "",
      description: p.description || "",
      url: p.url || "",
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
    }),
  );

  // Normalize awards
  merged.awards = (Array.isArray(merged.awards) ? merged.awards : []).map(
    (a) => ({
      title: a.title || a.name || "",
      date: a.date || a.year || "",
      awarder: a.awarder || a.issuer || "",
      summary: a.summary || "",
    }),
  );

  // Normalize languages
  merged.languages = (
    Array.isArray(merged.languages) ? merged.languages : []
  ).map((l) => ({
    language: l.language || "",
    fluency: l.fluency || "",
  }));

  // Normalize volunteer
  merged.volunteer = (
    Array.isArray(merged.volunteer) ? merged.volunteer : []
  ).map((v) => ({
    organization: v.organization || "",
    position: v.position || "",
    startDate: v.startDate || "",
    endDate: v.endDate || "",
    summary: v.summary || "",
  }));

  // Normalize publications
  merged.publications = (
    Array.isArray(merged.publications) ? merged.publications : []
  ).map((p) => ({
    name: p.name || "",
    publisher: p.publisher || "",
    releaseDate: p.releaseDate || "",
    url: p.url || "",
    summary: p.summary || "",
  }));

  // Normalize interests
  merged.interests = (
    Array.isArray(merged.interests) ? merged.interests : []
  ).map((i) => ({
    name: i.name || "",
    keywords: Array.isArray(i.keywords) ? i.keywords : [],
  }));

  if (!Array.isArray(merged.references)) merged.references = [];

  return merged;
}

// Route

const GROUNDING_DIRECTIVE = [
  "CRITICAL GROUNDING & ANTI-HALLUCINATION RULES (MUST BE STRICTLY FOLLOWED):",
  "1. You MUST base all generated text, summaries, skills, and rewrites STRICTLY and EXCLUSIVELY on the candidate's real resume data provided (their actual job titles, documented duties, real projects, and stated tech stack).",
  "2. DO NOT improvise, hallucinate, or invent fictitious employers, fake university degrees, unearned certifications, or completely unrelated job roles.",
  "3. When enriching bullets with metrics or action verbs, keep them realistic and tied directly to the candidate's actual documented responsibilities. Do NOT introduce unrelated tech stacks or exaggerated corporate metrics out of thin air.",
  "4. When suggesting skills, only recommend tools, frameworks, and competencies directly relevant and closely adjacent to the candidate's documented career and projects. Never dump generic unrelated buzzwords.",
].join(" ");

router.post("/upload-resume", optionalAuthenticateToken, upload.single("resumeFile"), async (req, res) => {
  try {
    let rawText = "";

    if (req.file) {
      const mime = req.file.mimetype || "";
      const originalName = (req.file.originalname || "").toLowerCase();

      if (mime === "application/pdf" || originalName.endsWith(".pdf")) {
        if (pdfParse) {
          const pdfData = await pdfParse(req.file.buffer);
          rawText = pdfData.text || "";
        } else {
          return res.status(400).json({ message: "PDF parser is not configured." });
        }
      } else {
        rawText = req.file.buffer.toString("utf-8");
      }
    } else if (req.body?.text) {
      rawText = req.body.text;
    } else {
      return res.status(400).json({ message: "No resume file or text provided." });
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ message: "Could not extract any text from the provided document." });
    }

    const system = [
      GROUNDING_DIRECTIVE,
      "You are an expert AI Resume Scraper and ATS Data Architect.",
      "Extract and structure the provided resume text into a clean, comprehensive resume profile JSON.",
      "STRICT ANTI-HALLUCINATION: Only extract real facts and credentials present in the document. Do not invent fake companies, degrees, or unearned certifications.",
      "Respond strictly as JSON matching schema: {",
      '  "personal": { "fullName": "", "targetTitle": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },',
      '  "summary": "",',
      '  "skills": { "technical": [""], "soft": [""] },',
      '  "workExperience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "bullets": [""] } ],',
      '  "education": [ { "institution": "", "degree": "", "graduationYear": "" } ]',
      "}",
    ].join(" ");

    const customModels = ["google/gemini-2.5-flash", "meta-llama/llama-3.3-70b-instruct"];

    const json = await generateJson({
      system,
      user: { rawResumeText: rawText.slice(0, 25000) },
      models: customModels,
    });

    const userId = req.userId || req.user?.id;
    if (userId) {
      User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
    }

    return res.json({
      success: true,
      profile: json,
      rawSnippet: rawText.slice(0, 1000),
    });
  } catch (err) {
    console.error("Upload & scrape resume error:", err);
    return res.status(500).json({
      message: "Failed to parse and extract resume: " + (err.message || "Unknown error"),
    });
  }
});

router.post("/", optionalAuthenticateToken, async (req, res) => {
  const {
    scope,
    prompt = "",
    resumeData = null,
    section = null,
    item = null,
  } = req.body || {};
  if (!scope) return badRequest(res, "Missing required field: scope");

  const userId = req.userId || req.user?.id;
  let copilotPref = { tone: "metrics", keywordDensity: 85, aiModel: "gemini-pro" };
  if (userId) {
    try {
      const u = await User.findById(userId).select("preferences");
      if (u?.preferences?.copilot) {
        copilotPref = { ...copilotPref, ...u.preferences.copilot };
      }
    } catch {}
  }

  let toneDirective = "";
  if (copilotPref.tone === "direct") {
    toneDirective = " Style: Direct and highly technical. Emphasize engineering depth, specific toolchains, and architectural complexity.";
  } else if (copilotPref.tone === "executive") {
    toneDirective = " Style: Executive and strategic. Emphasize cross-functional leadership, vision, team growth, and business expansion.";
  } else {
    toneDirective = " Style: Outcome and metrics-driven. Prioritize quantifiable KPIs, percentage increases, and measurable business impact.";
  }
  if (copilotPref.keywordDensity) {
    toneDirective += ` Target ATS keyword density: ${copilotPref.keywordDensity}%.`;
  }

  const customModels = copilotPref.aiModel === "gpt-4o"
    ? ["openai/gpt-4o-mini", "google/gemini-2.5-flash", "deepseek/deepseek-chat"]
    : undefined;

  // Fully normalize resume context so personalInfo and basics are unified
  const normalizedResume = normalizeResumeData(resumeData || {});
  const workContext = (normalizedResume.work || []).map((w) => {
    const role = `${w.position || ""} at ${w.company || ""}`.trim();
    const bullets = (Array.isArray(w.highlights) && w.highlights.length > 0)
      ? w.highlights.join("; ")
      : w.summary || "";
    return role ? (bullets ? `${role}: ${bullets}` : role) : "";
  }).filter(Boolean);

  const skillsContext = Array.isArray(normalizedResume.skills)
    ? normalizedResume.skills
        .flatMap((s) => (s?.keywords ? s.keywords : s))
        .filter(Boolean)
    : [];

  const projectsContext = (normalizedResume.projects || []).map((p) => {
    const title = p.name || "";
    const tech = (p.technologies || []).join(", ");
    return `${title}${tech ? ` (${tech})` : ""}${p.description ? `: ${p.description}` : ""}`;
  }).filter(Boolean);

  try {
    if (scope === "summary") {
      const system = [
        GROUNDING_DIRECTIVE,
        'You write concise, professional resume summaries (1–3 sentences). Ground the summary strictly in the candidate\'s actual experience, documented projects, and stated skills. Do NOT invent new credentials. Respond strictly as JSON with key "summary".',
        toneDirective,
      ].join(" ");

      const json = await generateJson({
        system,
        user: {
          prompt,
          basics: normalizedResume.basics,
          recentRoles: workContext.slice(0, 4),
          keySkills: skillsContext.slice(0, 15),
          projects: projectsContext.slice(0, 3),
        },
        schema: summarySchema,
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({
        summary: typeof json.summary === "string" ? json.summary.trim() : "",
      });
    }

    if (scope === "improve-header") {
      const { deficiency = "" } = req.body || {};
      const system = [
        GROUNDING_DIRECTIVE,
        "You are an ATS contact and header optimization specialist.",
        "Your task is to analyze the candidate's contact details and optimize them for ATS parser compliance.",
        "- If placeholder dummy data is present (e.g. 'jane.doe@example.com', 'Your Name'), clean it out and generate professional handles derived from their real name.",
        "- If email is missing or flagged, format a clean professional email based on their name (e.g. first.last@gmail.com).",
        "- If phone is missing, format a standard direct contact number with area code.",
        "- If location is missing, provide a standard format 'City, State/Country'.",
        "- If LinkedIn or GitHub is missing, format clean handles based on candidate's name (e.g. linkedin.com/in/fullname, github.com/fullname).",
        "- Always preserve genuine existing user information without overwriting it.",
        'Respond strictly as JSON with key "basics" containing: { name, label, email, phone, location: { city }, linkedin, github, url }.',
      ].join(" ");

      const json = await generateJson({
        system,
        user: { prompt, deficiency, currentBasics: normalizedResume.basics },
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({
        basics: json?.basics || normalizedResume.basics,
      });
    }

    if (scope === "education") {
      const system = [
        GROUNDING_DIRECTIVE,
        "You generate resume education entries in JSON.",
        "Each item may include institution, studyType, area, startDate, endDate, score, summary, courses.",
        toneDirective,
        'Respond strictly as JSON with key "education" (array).',
      ].join(" ");

      const json = await generateJson({
        system,
        user: { prompt, currentEducation: normalizedResume.education ?? [] },
        schema: educationSchema,
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({
        education: Array.isArray(json.education) ? json.education : [],
      });
    }

    if (scope === "experience-item") {
      const system = [
        GROUNDING_DIRECTIVE,
        "You create quantified, impact-driven bullet points for a resume experience entry.",
        "Highlight and strengthen accomplishments based on the role and responsibilities provided.",
        "Keep improvements authentic to the candidate's actual work domain; do NOT invent unrelated technologies.",
        toneDirective,
        'Respond strictly as JSON with key "highlights" (array of 2–4 strings) and optional "summary".',
      ].join(" ");

      const json = await generateJson({
        system,
        user: {
          prompt,
          item,
          candidateRole: normalizedResume.basics?.label,
          relevantSkills: skillsContext.slice(0, 10),
        },
        schema: workBulletsSchema,
        models: customModels,
      });

      const highlights = Array.isArray(json.highlights) ? json.highlights : [];
      const summary =
        typeof json.summary === "string"
          ? json.summary.trim()
          : highlights.join("\n");

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({
        highlights,
        summary,
      });
    }

    if (scope === "full") {
      const system = [
        GROUNDING_DIRECTIVE,
        "You are an expert resume writer that outputs a complete, professional JSON resume.",
        "Use keys: basics, work, education, skills, projects, awards, volunteer, publications, languages, interests.",
        "Preserve existing facts and credentials faithfully. Do not invent personal PII or fake histories beyond what is implied.",
        toneDirective,
        'Respond strictly as JSON with key "resumeData".',
      ].join(" ");

      const json = await generateJson({
        system,
        user: { prompt, existing: normalizedResume },
        schema: fullResumeSchema,
        models: customModels,
      });

      const output = normalizeResumeData(json?.resumeData || json);

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({ resumeData: output });
    }

    if (scope === "section") {
      if (!section) return badRequest(res, "Missing section for scope=section");

      const system = [
        GROUNDING_DIRECTIVE,
        `Generate only the '${section}' section for a resume in JSON based on the candidate's background.`,
        toneDirective,
        `Respond strictly as JSON, with only that section key at the root.`,
      ].join(" ");

      const json = await generateJson({
        system,
        user: { prompt, resumeData: normalizedResume, section },
        models: customModels,
      });

      return res.json(json);
    }

    if (scope === "improve-section") {
      const { sectionType, block: inputBlock } = req.body || {};
      const system = [
        GROUNDING_DIRECTIVE,
        "You are an elite ATS resume architect.",
        "Improve and enhance the provided resume section block.",
        "Refine wording, start each bullet with a high-action verb (spearheaded, engineered, optimized), and add realistic quantifiable impact metrics.",
        "Stay grounded in the candidate's actual documented role, project domain, and responsibilities. Do NOT invent new companies or fake jobs.",
        toneDirective,
        'Respond strictly as JSON with key "improvedBlock" (matching the input structure) and "changesSummary" (1 sentence explaining improvements).',
      ].join(" ");

      const json = await generateJson({
        system,
        user: {
          prompt,
          sectionType,
          block: inputBlock,
          candidateTitle: normalizedResume.basics?.label,
          workContext: workContext.slice(0, 3),
          skillsContext: skillsContext.slice(0, 10),
        },
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      const improvedBlock = json?.improvedBlock || inputBlock;
      // Guarantee that if work block was improved, both highlights and summary are synced
      if (improvedBlock && Array.isArray(improvedBlock.entries)) {
        improvedBlock.entries = improvedBlock.entries.map((entry) => {
          const bullets = Array.isArray(entry.highlights) && entry.highlights.length > 0
            ? entry.highlights
            : entry.summary
              ? entry.summary.split("\n").filter(Boolean)
              : [];
          return {
            ...entry,
            highlights: bullets,
            summary: bullets.join("\n"),
          };
        });
      }

      return res.json({
        improvedBlock,
        changesSummary: json?.changesSummary || "Optimized with metrics and action verbs.",
      });
    }

    if (scope === "skills-suggest") {
      const { roleTitle = "", currentSkills = [] } = req.body || {};
      const system = [
        GROUNDING_DIRECTIVE,
        "You are an ATS keyword specialist.",
        "Analyze the candidate's actual projects, work experience, and job title.",
        "Suggest 8–12 highly relevant industry skills, frameworks, tools, and competencies that specifically align with their actual domain.",
        "Avoid duplicates of already listed skills.",
        'Respond strictly as JSON with key "skills" (array of strings).',
      ].join(" ");

      const json = await generateJson({
        system,
        user: {
          prompt,
          roleTitle: roleTitle || normalizedResume.basics?.label,
          currentSkills,
          workHistory: workContext.slice(0, 3),
          projects: projectsContext.slice(0, 3),
        },
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      const skills = Array.isArray(json?.skills) ? json.skills : [];
      return res.json({ skills });
    }

    if (scope === "chat-assistant") {
      const { message: userMessage, history = [], draftState = null } = req.body || {};

      const hasContact = draftState?.hasContact ?? !!(normalizedResume.basics?.name && (normalizedResume.basics?.email || normalizedResume.basics?.phone));
      const hasSummary = draftState?.hasSummary ?? !!(normalizedResume.basics?.summary && normalizedResume.basics.summary.length > 20);
      const experienceCount = draftState?.experienceCount ?? (Array.isArray(normalizedResume.work) ? normalizedResume.work.length : 0);
      const hasEducation = draftState?.hasEducation ?? (Array.isArray(normalizedResume.education) && normalizedResume.education.length > 0);
      const hasSkills = draftState?.hasSkills ?? (Array.isArray(normalizedResume.skills) && normalizedResume.skills.length > 0);

      const system = [
        GROUNDING_DIRECTIVE,
        "You are an expert AI Resume Writer and Resume Builder Co-Pilot. Your goal is to help users construct a clean, high-impact, ATS-optimized resume.",
        "--- SYSTEM CONSTRAINTS & BEHAVIOR ---",
        "1. VALUE-FIRST RESUME ONBOARDING & AUTOMATIC FULL RESUME GENERATION",
        "- If the user has NOT provided their information yet: Ask them if they have an existing resume, LinkedIn export, or rough notes to paste.",
        "- AUTOMATIC FULL-PROFILE EXTRACTION (NO SECTION-BY-SECTION INTERROGATION):",
        "  When the user provides or pastes their resume, CV, LinkedIn text, notes, or background information:",
        "  DO NOT interrogate them section by section.",
        "  DO NOT ask them one section at a time or make them confirm each part across multiple turns.",
        "  IMMEDIATELY extract, structure, and generate the FULL resume with ALL sections at once!",
        "  Emit <<act:generateResume {...}>> with the complete structured resume data so they can apply everything to their canvas in 1 single click:",
        '  <<act:generateResume {"personal":{"fullName":"...","targetTitle":"...","email":"...","phone":"...","location":"...","linkedin":"...","website":"..."},"summary":"...","workExperience":[{"company":"...","role":"...","startDate":"...","endDate":"...","bullets":["..."]}],"education":[{"institution":"...","degree":"...","graduationYear":"..."}],"skills":{"technical":["..."],"tools":["..."],"soft":["..."]},"projects":[{"name":"...","description":"...","technologies":["..."],"url":"..."}]}>>',
        "  In addition, emit individual section action envelopes (<<act:setContactInfo ...>>, <<act:updateSummary ...>>, <<act:addExperience ...>>, <<act:updateSkills ...>>) so the user can see visual preview cards for each section.",
        "2. PROPOSE, DON'T IMPOSE (USER CONFIRMATION GATE)",
        "- Emit action envelopes on a standalone line to present interactive preview cards in the UI:",
        "  <<act:ACTION_NAME {\"key\": \"value\"}>>",
        "--- AVAILABLE ACTION ENVELOPES ---",
        "- `setContactInfo`: Proposes contact info & headliner title.",
        '  Format: <<act:setContactInfo {"fullName":"Jane Doe","targetTitle":"Senior Fullstack Engineer","email":"jane@example.com","phone":"+1 555-0199","location":"San Francisco, CA","linkedin":"linkedin.com/in/janedoe","website":"janedoe.dev"}>>',
        "- `updateSummary`: Proposes an executive summary/bio draft.",
        '  Format: <<act:updateSummary {"summary":"Results-oriented Software Engineer with 7+ years of experience..."}>>',
        "- `addExperience`: Proposes adding or revising a work experience entry.",
        '  Format: <<act:addExperience {"company":"Tech Corp","role":"Senior Engineer","dates":"2021 - Present","bullets":["Led team of 5 engineers...","Improved system throughput by 35%..."]}>>',
        "- `updateSkills`: Proposes grouped skills list.",
        '  Format: <<act:updateSkills {"technical":["React","Node.js","Python"],"tools":["Git","Docker","Figma"],"soft":["Cross-functional Leadership"]}>>',
        "- `generateResume`: Full resume generation containing all sections.",
        '  Format: <<act:generateResume {"personal":{...},"summary":"...","workExperience":[...],"education":[...],"skills":{...},"projects":[...]}>>',
        "--- WORK VS PROJECTS SEPARATION ---",
        "- 'workExperience' MUST only contain genuine company/organization employment.",
        "- Personal apps, open-source repositories, university projects, and side projects MUST be placed in 'projects'!",
        "--- CURRENT RESUME DRAFT STATE ---",
        `- Has Contact Info: ${hasContact ? "YES" : "NO"}`,
        `- Has Summary: ${hasSummary ? "YES" : "NO"}`,
        `- Experience Count: ${experienceCount}`,
        `- Has Education: ${hasEducation ? "YES" : "NO"}`,
        `- Has Skills: ${hasSkills ? "YES" : "NO"}`,
        "--- WRITING STYLE ---",
        "- Use strong action verbs (Architected, Spearheaded, Accelerated, Optimized) for bullet points.",
        "- Quantify achievements with metrics and percentage gains wherever possible.",
        "- When full data is provided, enthusiastically confirm that you have parsed their entire background and prepared 1-click proposals for all sections.",
        toneDirective,
        'Respond strictly as JSON with "reply" (string in markdown containing your conversational text and <<act:...>> tags on standalone lines) and optional "patch" (legacy object for backward compatibility).',
      ].join("\n");

      const json = await generateJson({
        system,
        user: { message: userMessage, history, resumeData: normalizedResume },
        models: customModels,
      });

      if (userId) {
        User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
      }

      return res.json({
        reply: json?.reply || "Here are recommendations to elevate your resume.",
        patch: json?.patch || null,
      });
    }

    if (scope === "career-ops") {
      const { action = "extract-baseline", rawText = "", careerProfile = {} } = req.body || {};

      if (action === "extract-baseline") {
        const system = [
          GROUNDING_DIRECTIVE,
          "You are an expert CareerOps technical recruiter and resume architect.",
          "Analyze the provided raw text, rough career notes, or previous resume text.",
          "Extract and structure a clean Master Career Baseline Profile.",
          "Infer fullName, targetRole, and seniority from the text or experience duration.",
          "Seniority MUST strictly be one of: 'Entry / Associate (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Staff / Principal (8+ yrs)', 'Director / Executive'.",
          "Extract contact details if found: phone, location (City, State/Country), linkedin URL/handle, github URL/handle, and personal website URL.",
          "Formulate a strong 2–3 sentence executive career bio.",
          "Extract clean skill keywords (8–15 items).",
          "Structure work experiences with company, position, dates, and metric-driven bullet points.",
          "CRITICAL SEPARATION OF WORK EXPERIENCE VS PROJECTS:",
          "- 'experiences' MUST ONLY contain genuine employment, jobs, or contractor roles at companies or organizations.",
          "- Personal projects, open-source repositories, portfolio apps, side projects, hackathons, and university projects MUST NEVER be classified as work experience! They MUST strictly be extracted into the 'projects' array (name, description, technologies, url).",
          "Extract education entries.",
          "Strict anti-hallucination rule: Only extract information that is explicitly stated or directly implied by the candidate's actual text. Do NOT invent new companies or degrees.",
          'Respond strictly as JSON matching: { fullName, targetRole, seniority, bio, phone, location, linkedin, github, website, skills, experiences, education, projects }.',
        ].join(" ");

        const json = await generateJson({
          system,
          user: { rawText, currentProfile: careerProfile },
          schema: careerBaselineSchema,
          models: customModels,
        });

        if (userId) {
          User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
        }

        // Normalize seniority to match the select dropdown exactly
        let normalizedSeniority = json?.seniority || "Senior (5-8 yrs)";
        const validOptions = [
          "Entry / Associate (0-2 yrs)",
          "Mid-Level (3-5 yrs)",
          "Senior (5-8 yrs)",
          "Staff / Principal (8+ yrs)",
          "Director / Executive",
        ];
        const matched = validOptions.find((opt) =>
          opt.toLowerCase().includes((json?.seniority || "").toLowerCase().slice(0, 4))
        );
        if (matched) normalizedSeniority = matched;

        return res.json({
          careerProfile: {
            fullName: json?.fullName || "",
            targetRole: json?.targetRole || "",
            seniority: normalizedSeniority,
            bio: json?.bio || "",
            phone: json?.phone || "",
            location: json?.location || "",
            linkedin: json?.linkedin || "",
            github: json?.github || "",
            website: json?.website || "",
            skills: Array.isArray(json?.skills) ? json.skills : [],
            experiences: Array.isArray(json?.experiences) ? json.experiences : [],
            education: Array.isArray(json?.education) ? json.education : [],
            projects: Array.isArray(json?.projects) ? json.projects : [],
          },
        });
      }

      if (action === "polish-bio") {
        const { targetRole, seniority, skills = [], experiences = [], currentBio = "" } = req.body || {};
        const system = [
          GROUNDING_DIRECTIVE,
          "You are an executive resume writer.",
          "Write a concise, commanding 2–3 sentence master career summary/bio based strictly on the candidate's actual target role, seniority, core skills, and work history.",
          "Highlight concrete technical strengths and leadership competencies without fluff.",
          toneDirective,
          'Respond strictly as JSON with key "bio" (string).',
        ].join(" ");

        const json = await generateJson({
          system,
          user: { targetRole, seniority, skills, experiences, currentBio },
          models: customModels,
        });

        if (userId) {
          User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
        }

        return res.json({ bio: json?.bio || "" });
      }

      if (action === "enrich-experience") {
        const { experience } = req.body || {};
        const system = [
          GROUNDING_DIRECTIVE,
          "You are an ATS optimization specialist.",
          "Enrich the candidate's work experience bullets for the specified role.",
          "Transform weak or passive bullets into strong, quantified accomplishments using strong action verbs (e.g. Engineered, Spearheaded, Accelerated, Reduced).",
          "Ensure every bullet stays strictly grounded in their stated role and company.",
          toneDirective,
          'Respond strictly as JSON with key "highlights" (array of 3–5 bullet strings).',
        ].join(" ");

        const json = await generateJson({
          system,
          user: { experience },
          models: customModels,
        });

        if (userId) {
          User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
        }

        return res.json({ highlights: Array.isArray(json?.highlights) ? json.highlights : [] });
      }

      if (action === "suggest-skills") {
        const { targetRole, seniority, currentSkills = [], experiences = [] } = req.body || {};
        const system = [
          GROUNDING_DIRECTIVE,
          "You are an ATS technical recruiter.",
          "Suggest 10–14 high-demand, industry-standard technical tools, frameworks, languages, and methodologies that directly align with the candidate's target role and actual domain experience.",
          "Avoid duplicate skills already present in their list.",
          'Respond strictly as JSON with key "skills" (array of strings).',
        ].join(" ");

        const json = await generateJson({
          system,
          user: { targetRole, seniority, currentSkills, experiences },
          models: customModels,
        });

        if (userId) {
          User.findByIdAndUpdate(userId, { $inc: { "usage.aiRewrites": 1 } }).catch(() => {});
        }

        return res.json({ skills: Array.isArray(json?.skills) ? json.skills : [] });
      }
    }

    return badRequest(res, `Unsupported scope: ${scope}`);
  } catch (err) {
    console.error("AI route error:", err);
    const message =
      err?.response?.data?.error?.message ||
      err?.message ||
      "AI generation failed.";
    return res.status(500).json({ message });
  }
});

const atsCheckSchema = {
  type: "object",
  properties: {
    score: { type: "number", description: "Overall ATS score from 0-100" },
    keywordScore: { type: "number", description: "Keyword match score from 0-100" },
    syntaxScore: { type: "number", description: "Syntax and formatting score from 0-100" },
    impactScore: { type: "number", description: "Action verbs and quantified impact score from 0-100" },
    matchedKeywords: { type: "array", items: { type: "string" }, description: "List of found keywords" },
    missingKeywords: { type: "array", items: { type: "string" }, description: "List of recommended missing keywords" },
  },
  required: [
    "score",
    "keywordScore",
    "syntaxScore",
    "impactScore",
    "matchedKeywords",
    "missingKeywords",
  ],
};

router.post("/ats/check", optionalAuthenticateToken, async (req, res) => {
  const { resumeData, jobDescription = "" } = req.body || {};
  const userId = req.userId || req.user?.id;
  const baseAts = calculateAtsScore(resumeData || {});

  if (userId) {
    User.findByIdAndUpdate(userId, { $inc: { "usage.atsScans": 1 } }).catch(() => {});
  }

  try {
    const system = [
      "You are an expert ATS (Applicant Tracking System) parser and resume reviewer.",
      "Analyze the provided resume JSON data against the given job description (if provided, else general industry best practices).",
      "Evaluate it strictly on: keyword density, formatting simplicity (syntax), and quantified accomplishments.",
      "Return a strict JSON object grading the resume."
    ].join(" ");

    const json = await generateJson({
      system,
      user: { resumeData, jobDescription },
      schema: atsCheckSchema,
    });

    return res.json({
      score: baseAts.score,
      keywordScore: json.keywordScore || Math.round((baseAts.breakdown.skillsScore / 15) * 100),
      syntaxScore: json.syntaxScore || Math.round(((baseAts.breakdown.contactScore + baseAts.breakdown.sectionsScore) / 40) * 100),
      impactScore: json.impactScore || Math.round(((baseAts.breakdown.metricsScore + baseAts.breakdown.actionVerbsScore) / 45) * 100),
      matchedKeywords: Array.isArray(json.matchedKeywords) ? json.matchedKeywords : [],
      missingKeywords: Array.isArray(json.missingKeywords) ? json.missingKeywords : [],
      breakdown: baseAts.breakdown,
      feedback: baseAts.feedback,
    });
  } catch (err) {
    console.error("ATS Check error:", err);
    return res.json({
      score: baseAts.score,
      keywordScore: Math.round((baseAts.breakdown.skillsScore / 15) * 100),
      syntaxScore: Math.round(((baseAts.breakdown.contactScore + baseAts.breakdown.sectionsScore) / 40) * 100),
      impactScore: Math.round(((baseAts.breakdown.metricsScore + baseAts.breakdown.actionVerbsScore) / 45) * 100),
      matchedKeywords: [],
      missingKeywords: [],
      breakdown: baseAts.breakdown,
      feedback: baseAts.feedback,
    });
  }
});

module.exports = router;
