const express = require("express");

const router = express.Router();

const BUILTIN_ATS_TEMPLATES = [
  {
    id: "ats-classic",
    name: "ATS Classic",
    category: "ATS Minimalist",
    description: "100% ATS-optimized single-column layout for maximum parser pass rates.",
    isAts: true,
    fontFamily: "Inter",
    layoutVariant: "classic",
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#475569",
        accent: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-modern",
    name: "ATS Modern Accent",
    category: "ATS Modern",
    description: "Sleek left accent color borders and contemporary typography with 100% machine readability.",
    isAts: true,
    fontFamily: "Outfit",
    layoutVariant: "modern",
    theme: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#2563eb",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Outfit, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-executive",
    name: "ATS Executive Serif",
    category: "ATS Corporate",
    description: "Centered aristocratic header with Georgia serif typography and refined horizontal divider rules.",
    isAts: true,
    fontFamily: "Georgia",
    layoutVariant: "executive",
    theme: {
      colors: {
        primary: "#1e293b",
        secondary: "#64748b",
        accent: "#334155",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Georgia, serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "40px 48px",
      },
      sections: [],
    },
  },
  {
    id: "ats-developer",
    name: "ATS Tech & Developer",
    category: "ATS Engineering",
    description: "Designed for software engineers and architects with skill-first prioritization and monospace accents.",
    isAts: true,
    fontFamily: "Roboto",
    layoutVariant: "developer",
    theme: {
      colors: {
        primary: "#0f766e",
        secondary: "#475569",
        accent: "#0f766e",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Roboto, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-compact",
    name: "ATS Compact 1-Page",
    category: "ATS High-Density",
    description: "High-density single-page structure engineered to fit full careers cleanly without page overflow.",
    isAts: true,
    fontFamily: "Inter",
    layoutVariant: "compact",
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#4b5563",
        accent: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "24px 32px",
      },
      sections: [],
    },
  },
];

// GET /api/templates - Get all templates (strictly ATS templates)
router.get("/", async (req, res) => {
  try {
    return res.json(BUILTIN_ATS_TEMPLATES);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/templates/:id - Get one template by ID
router.get("/:id", async (req, res) => {
  try {
    const found = BUILTIN_ATS_TEMPLATES.find(
      (t) => t.id === req.params.id || t._id === req.params.id,
    );
    if (found) {
      return res.json(found);
    }
    return res.json(BUILTIN_ATS_TEMPLATES[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
