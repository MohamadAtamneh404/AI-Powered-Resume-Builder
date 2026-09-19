const express = require("express");
const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const { authenticateToken } = require("./auth");

const router = express.Router();

// DEV-ONLY helper: derive user id
function getUserId(req) {
  return (
    req.user?.id ||
    req.userId ||
    req.auth?.id ||
    req.headers["x-user-id"] || // Dev header; set from frontend during dev
    null
  );
}

function ensureUser(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: missing user." });
    return null;
  }
  try {
    return mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  } catch {
    return userId;
  }
}

// Only accept allowed fields
function pickResumeFields(body = {}) {
  const {
    title,
    templateId,
    theme,
    style,
    basics,
    blocks,
    resumeData,
    atsScore,
  } = body;
  return {
    title,
    templateId,
    theme,
    style,
    basics,
    blocks,
    resumeData,
    atsScore,
  };
}

const { calculateAtsScore } = require("../utils/atsScorer");

function toClient(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id;
  delete obj.__v;
  try {
    const atsResult = calculateAtsScore(obj);
    obj.atsScore =
      typeof obj.atsScore === "number" && obj.atsScore > 0
        ? obj.atsScore
        : atsResult.score;
    obj.atsBreakdown = atsResult.breakdown;
  } catch (_e) {
    obj.atsScore =
      typeof obj.atsScore === "number" && obj.atsScore > 0 ? obj.atsScore : 75;
  }
  return obj;
}

const validate = require("../middlewares/validate");

// Create new resume
router.post(
  "/",
  authenticateToken,
  validate({ templateId: "string?" }),
  async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const data = pickResumeFields(req.body);
      if (!data.templateId || typeof data.templateId !== "string") {
        data.templateId =
          data.templateId?._id || data.templateId?.id || "ats-classic";
      }
      if (!data.title || !String(data.title).trim()) {
        data.title = "Untitled Resume";
      }
      const created = await Resume.create({ userId: uid, ...data });
      return res.status(201).json(toClient(created));
    } catch (err) {
      return next(err);
    }
  },
);

// List current user's resumes
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const uid = ensureUser(req, res);
    if (!uid) return;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Resume.find({ userId: uid })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Resume.countDocuments({ userId: uid }),
    ]);

    const mapped = items.map(toClient);
    return res.json({
      items: mapped,
      resumes: mapped,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
});

// Read one
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const uid = ensureUser(req, res);
    if (!uid) return;

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Resume not found" });
    }
    const doc = await Resume.findOne({ _id: id, userId: uid });
    if (!doc) return res.status(404).json({ message: "Resume not found" });
    return res.json(toClient(doc));
  } catch (err) {
    return next(err);
  }
});

// Update
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const uid = ensureUser(req, res);
    if (!uid) return;

    const { id } = req.params;
    const data = pickResumeFields(req.body);
    if (!data.templateId || typeof data.templateId !== "string") {
      data.templateId =
        data.templateId?._id || data.templateId?.id || "ats-classic";
    }

    // If ID is not a valid Mongo ObjectId (e.g. draft_12345), create a new resume instead of throwing CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (!data.title || !String(data.title).trim()) {
        data.title = "Untitled Resume";
      }
      const created = await Resume.create({ userId: uid, ...data });
      return res.status(201).json(toClient(created));
    }

    let updated = await Resume.findOneAndUpdate(
      { _id: id, userId: uid },
      { $set: data },
      { new: true },
    );
    if (!updated) {
      updated = await Resume.create({ userId: uid, ...data });
    }
    return res.json(toClient(updated));
  } catch (err) {
    return next(err);
  }
});

// Delete
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const uid = ensureUser(req, res);
    if (!uid) return;

    const { id } = req.params;
    const removed = await Resume.findOneAndDelete({ _id: id, userId: uid });
    if (!removed) return res.status(404).json({ message: "Resume not found" });
    return res.json({ ok: true, id });
  } catch (err) {
    return next(err);
  }
});

// Render a resume with a theme
router.post("/render", authenticateToken, async (req, res, next) => {
  try {
    const { resumeData, themeName = "elegant" } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "resumeData is required" });
    }

    const themes = req.app.get("themes");
    const theme = themes[themeName];
    if (!theme) {
      return res
        .status(400)
        .json({ message: `Theme '${themeName}' not found` });
    }

    // Use a simple render function from the theme
    const html = theme.render(resumeData);
    return res.send(html);
  } catch (err) {
    return next(err);
  }
});

// =============================
// PDF Export Route (High-Fidelity)
// =============================
router.post("/export-pdf", async (req, res, next) => {
  try {
    const {
      html: componentHtml,
      templateId,
      embedAtsJson,
      resumeData,
    } = req.body;
    if (!componentHtml) {
      return res.status(400).json({ message: "HTML content is required" });
    }

    const jsonLdScript =
      embedAtsJson && resumeData
        ? `
    <script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: resumeData?.basics?.name || "",
        jobTitle: resumeData?.basics?.label || "",
        email: resumeData?.basics?.email || "",
        telephone: resumeData?.basics?.phone || "",
        url: resumeData?.basics?.url || "",
        description: resumeData?.basics?.summary || "",
      })}
    </script>
    `
        : "";

    // Build unified HTML document for Puppeteer rendering
    const finalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume</title>
    ${jsonLdScript}

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Merriweather:wght@300;400;700&family=Georgia&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN for Tailwind-styled templates -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
              serif: ['Georgia', 'Merriweather', 'serif'],
              mono: ['SF Mono', 'Courier New', 'monospace'],
            }
          }
        }
      };
    </script>

    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }

      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        min-height: 297mm;
        background: #ffffff;
        color: #111827;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Base page container for templates */
      .page {
        width: 210mm;
        min-height: 297mm;
        box-sizing: border-box;
        margin: 0 auto;
        position: relative;
        background: #ffffff;
      }

      /* Columns for split/grid templates */
      .resume-sidebar {
        box-sizing: border-box;
        min-height: 297mm;
      }

      .resume-main {
        box-sizing: border-box;
        min-height: 297mm;
      }

      /* Prevent page breaks inside section headers and items */
      .resume-section,
      .repeatable-item,
      section,
      article,
      header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* SVG Icon alignment */
      svg {
        display: inline-block;
        vertical-align: middle;
        flex-shrink: 0;
      }

      /* Reset top margin on first element */
      body > :first-child {
        margin-top: 0 !important;
      }
    </style>
  </head>
  <body>
    ${componentHtml}
  </body>
</html>`;

    const puppeteer = req.app.get("puppeteer");
    if (!puppeteer) {
      return res.status(501).json({
        success: false,
        error:
          "Server-side PDF generation is unavailable in this environment. Please use client-side print / export.",
      });
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(finalHtml, {
      waitUntil: "networkidle0",
      timeout: 25000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    return res.send(pdf);
  } catch (err) {
    console.error("PDF Export Error:", err);
    return next(err);
  }
});

module.exports = router;
