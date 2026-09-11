import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ReactDOMServer from "react-dom/server";

import EditorTopBar from "./EditorTopBar";
import EditorSidebar from "./EditorSidebar";
import EditorCanvas from "./EditorCanvas";
import CanvasPrintRenderer from "./CanvasPrintRenderer";
import ResumeRenderer, {
  AtsClassicRenderer,
} from "../../ResumeTemplates/ResumeRenderer";
import { AtsCopilotDrawer, AiAssistantDrawer } from "../EditorUI";
import OnboardingModal from "../OnboardingModal";
import NewResumeModal from "../NewResumeModal";
import { calculateAtsScore } from "../../../Utility/atsScoreEngine";
import { useUser } from "../../../Context/UserContext";
import { CheckCircle2 } from "lucide-react";

// ─── Block Definitions & Templates (mirrored from legacy) ─────────────

const BLOCK_CONFIG = {
  header: { singleton: true },
  summary: { singleton: true },
  work: { singleton: true },
  education: { singleton: true },
  skills: { singleton: true },
  projects: { singleton: true },
  awards: { singleton: true },
  volunteer: { singleton: true },
  publications: { singleton: true },
  languages: { singleton: true },
  interests: { singleton: true },
};

const TEMPLATES = {
  header: () => ({ type: "header", title: "Header", options: {} }),
  summary: () => ({ type: "summary", title: "Summary", content: "" }),
  work: () => ({
    type: "work",
    title: "Experience",
    entries: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        summary: "",
        highlights: [],
      },
    ],
  }),
  education: () => ({
    type: "education",
    title: "Education",
    entries: [
      {
        institution: "",
        studyType: "",
        area: "",
        startDate: "",
        endDate: "",
        score: "",
        summary: "",
      },
    ],
  }),
  skills: () => ({
    type: "skills",
    title: "Skills",
    groups: [
      {
        name: "Languages",
        level: "",
        keywords: ["TypeScript", "JavaScript", "Python"],
      },
      { name: "Frameworks", level: "", keywords: ["React", "Node.js"] },
    ],
  }),
  projects: () => ({
    type: "projects",
    title: "Projects",
    entries: [{ name: "", description: "", url: "", technologies: [] }],
  }),
  awards: () => ({
    type: "awards",
    title: "Awards",
    entries: [{ title: "", date: "", awarder: "", summary: "" }],
  }),
  volunteer: () => ({
    type: "volunteer",
    title: "Volunteer",
    entries: [
      {
        organization: "",
        position: "",
        startDate: "",
        endDate: "",
        summary: "",
      },
    ],
  }),
  publications: () => ({
    type: "publications",
    title: "Publications",
    entries: [
      { name: "", publisher: "", releaseDate: "", url: "", summary: "" },
    ],
  }),
  languages: () => ({
    type: "languages",
    title: "Languages",
    entries: [{ language: "", fluency: "" }],
  }),
  interests: () => ({
    type: "interests",
    title: "Interests",
    entries: [{ name: "", keywords: [] }],
  }),
};

const SECTION_TYPE_TO_BLOCK = {
  Header: "header",
  Experience: "work",
  Education: "education",
  Skills: "skills",
  Projects: "projects",
  Awards: "awards",
  Volunteer: "volunteer",
  Publications: "publications",
  Languages: "languages",
};

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

const ATS_CLASSIC_TEMPLATE = BUILTIN_ATS_TEMPLATES[0];

const blockTypeToResumeJsonSection = {
  header: "header",
  summary: "summary",
  work: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  awards: "awards",
  volunteer: "volunteer",
  publications: "publications",
  languages: "languages",
  interests: "interests",
};

const DEFAULT_SECTION_TEMPLATES = {
  projects: {
    id: "projects",
    type: "repeatable-section",
    showTitle: true,
    title: "Projects",
    dataPath: "projects",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "14px",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "primary",
      borderBottom: "1px solid #111827",
      paddingBottom: "4px",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "16px" },
    elements: [
      {
        type: "text",
        dataPath: "name",
        style: { fontSize: "14px", fontWeight: "bold", color: "primary" },
      },
      {
        type: "text",
        dataPath: "description",
        style: {
          marginTop: "4px",
          marginBottom: "8px",
          fontSize: "12px",
          color: "#374151",
        },
      },
      {
        type: "tag-list",
        dataPath: "technologies",
        tagStyle: {
          backgroundColor: "#f4f4f5",
          color: "#18181b",
          border: "1px solid #e4e4e7",
          padding: "2px 8px",
          margin: "2px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "500",
        },
      },
    ],
  },
  awards: {
    id: "awards",
    type: "repeatable-section",
    showTitle: true,
    title: "Awards & Certifications",
    dataPath: "awards",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "primary",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "title", style: { fontWeight: "bold" } },
      {
        type: "text",
        template: "{awarder} | {date}",
        style: { color: "secondary", fontSize: "14px" },
      },
    ],
  },
  volunteer: {
    id: "volunteer",
    type: "repeatable-section",
    showTitle: true,
    title: "Volunteer Experience",
    dataPath: "volunteer",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "primary",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "20px" },
    elements: [
      {
        type: "text",
        dataPath: "position",
        style: { fontSize: "18px", fontWeight: "bold" },
      },
      {
        type: "text",
        dataPath: "organization",
        style: { fontStyle: "italic", color: "secondary" },
      },
      {
        type: "text",
        template: "{startDate} - {endDate}",
        style: { fontSize: "14px", color: "secondary", marginBottom: "8px" },
      },
      { type: "text", dataPath: "summary" },
    ],
  },
  publications: {
    id: "publications",
    type: "repeatable-section",
    showTitle: true,
    title: "Publications",
    dataPath: "publications",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "primary",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "name", style: { fontWeight: "bold" } },
      {
        type: "text",
        template: "{publisher} | {releaseDate}",
        style: { color: "secondary", fontSize: "14px" },
      },
    ],
  },
  languages: {
    id: "languages",
    type: "repeatable-section",
    showTitle: true,
    title: "Languages",
    dataPath: "languages",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "primary",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "8px" },
    elements: [{ type: "text", template: "{language}: {fluency}" }],
  },
  interests: {
    id: "interests",
    type: "repeatable-section",
    showTitle: true,
    title: "Interests",
    dataPath: "interests",
    style: { marginBottom: "24px" },
    titleStyle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "primary",
      marginBottom: "12px",
    },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "name", style: { fontWeight: "bold" } },
      {
        type: "tag-list",
        dataPath: "keywords",
        tagStyle: {
          backgroundColor: "#e5e7eb",
          color: "#374151",
          padding: "2px 8px",
          margin: "2px",
          borderRadius: "4px",
          fontSize: "12px",
        },
      },
    ],
  },
};

function composeResumeJson(blocks, basics) {
  const linkedinRaw =
    basics.linkedin ||
    (basics.profiles || []).find(
      (p) => p.network?.toLowerCase() === "linkedin",
    )?.username ||
    "";
  const githubRaw =
    basics.github ||
    (basics.profiles || []).find(
      (p) => p.network?.toLowerCase() === "github",
    )?.username ||
    "";

  const resumeData = {
    personalInfo: {
      name: basics.name || "",
      title: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location:
        typeof basics.location === "string"
          ? basics.location
          : basics.location?.city || "",
      website: basics.url || "",
      linkedin: linkedinRaw
        ? linkedinRaw.includes("linkedin.com")
          ? linkedinRaw.replace(/^https?:\/\/(www\.)?/, "")
          : `linkedin.com/in/${linkedinRaw}`
        : "",
      github: githubRaw
        ? githubRaw.includes("github.com")
          ? githubRaw.replace(/^https?:\/\/(www\.)?/, "")
          : `github.com/${githubRaw}`
        : "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    awards: [],
    certifications: [],
    volunteer: [],
    publications: [],
    languages: [],
    interests: [],
  };

  blocks.forEach((block) => {
    if (!block || !block.type) return;

    switch (block.type) {
      case "summary":
        resumeData.personalInfo.summary = block.content || "";
        break;
      case "work":
        resumeData.experience = (block.entries || []).map((entry) => {
          const bullets =
            Array.isArray(entry.highlights) && entry.highlights.length > 0
              ? entry.highlights
              : entry.summary
                ? entry.summary.split("\n").filter(Boolean)
                : [];
          return {
            company: entry.company || "",
            title: entry.position || "",
            location: entry.location || "",
            startDate: entry.startDate || "",
            endDate: entry.endDate || "",
            highlights: bullets,
            description: bullets,
            summary: entry.summary || bullets.join("\n"),
          };
        });
        break;
      case "education":
        resumeData.education = (block.entries || []).map((entry) => ({
          institution: entry.institution || "",
          degree: entry.studyType || "",
          area: entry.area || "",
          startDate: entry.startDate || "",
          endDate: entry.endDate || "",
          year: entry.endDate || "",
          gpa: entry.score || "",
          summary: entry.summary || "",
        }));
        break;
      case "skills":
        resumeData.skills = (block.groups || [])
          .flatMap((g) => g.keywords || [])
          .filter(Boolean);
        resumeData.skillGroups = (block.groups || []).map((g) => ({
          name: g.name || "General",
          keywords: (g.keywords || []).filter(Boolean),
        }));
        break;
      case "projects":
        resumeData.projects = (block.entries || [])
          .map((p) => ({
            name: p.name || "",
            description: p.description || "",
            url: p.url || "",
            technologies: Array.isArray(p.technologies)
              ? p.technologies.filter(Boolean)
              : [],
          }))
          .filter((p) => p.name);
        break;
      case "awards":
        const awardsData = (block.entries || []).map((a) => ({
          title: a.title || "",
          date: a.date || "",
          awarder: a.awarder || "",
          summary: a.summary || "",
        }));
        resumeData.awards = awardsData;
        resumeData.certifications = awardsData.map((a) => ({
          name: a.title,
          year: a.date,
          issuer: a.awarder,
        }));
        break;
      case "volunteer":
        resumeData.volunteer = (block.entries || []).map((v) => ({
          organization: v.organization || "",
          position: v.position || "",
          startDate: v.startDate || "",
          endDate: v.endDate || "",
          summary: v.summary || "",
        }));
        break;
      case "publications":
        resumeData.publications = (block.entries || []).map((p) => ({
          name: p.name || "",
          publisher: p.publisher || "",
          releaseDate: p.releaseDate || "",
          url: p.url || "",
          summary: p.summary || "",
        }));
        break;
      case "languages":
        resumeData.languages = (block.entries || []).map((l) => ({
          language: l.language || "",
          fluency: l.fluency || "",
        }));
        break;
      case "interests":
        resumeData.interests = (block.entries || []).map((i) => ({
          name: i.name || "",
          keywords: i.keywords || [],
        }));
        break;
      default:
        break;
    }
  });

  return resumeData;
}

export default function ResumeEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeName, setResumeName] = useState("New Resume");

  const [basics, setBasics] = useState({
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    location: { city: "", region: "", countryCode: "" },
    profiles: [],
  });
  const [blocks, setBlocks] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("ats-classic");
  const [theme, setTheme] = useState("minimal");

  const [activeRailTab, setActiveRailTab] = useState(null); // 'sections' | 'design' | 'templates' | 'ai' | null
  const [activeFont, setActiveFont] = useState("Inter");
  const [activeThemeColor, setActiveThemeColor] = useState("#9fff00");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAtsDrawer, setShowAtsDrawer] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [fixingPartId, setFixingPartId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [hasPromptedNewModal, setHasPromptedNewModal] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingSection, setAiLoadingSection] = useState(null);

  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'unsaved'
  const [resumeId, setResumeId] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [rendering, setRendering] = useState(false);

  const { user } = useUser();
  const [aiPatchNotification, setAiPatchNotification] = useState("");

  const syncCareerProfile = useCallback((profile = null) => {
    const cp = profile || user?.careerProfile;
    if (!cp) return;

    setBasics((prev) => ({
      ...prev,
      name: cp.fullName || user?.fullName || prev.name || "",
      email: cp.email || user?.email || prev.email || "",
      phone: cp.phone || prev.phone || "",
      label: cp.targetRole || prev.label || "",
      summary: cp.bio || prev.summary || "",
      location: {
        ...(prev.location || {}),
        city: cp.location || prev.location?.city || "",
      },
      profiles: [
        ...(cp.linkedin ? [{ network: "LinkedIn", url: cp.linkedin, username: cp.linkedin.split("/").filter(Boolean).pop() || "" }] : []),
        ...(cp.github ? [{ network: "GitHub", url: cp.github, username: cp.github.split("/").filter(Boolean).pop() || "" }] : []),
      ],
    }));

    if (cp.targetRole) {
      setResumeName(`${cp.targetRole} Resume`);
    }

    setBlocks((prev) => {
      let next = [...prev];
      if (!next.some((b) => b.type === "header")) {
        next.unshift(TEMPLATES.header());
      }

      if (cp.bio) {
        const idx = next.findIndex((b) => b.type === "summary");
        if (idx !== -1) {
          next[idx] = { ...next[idx], content: cp.bio };
        } else {
          next.push({ type: "summary", title: "Summary", content: cp.bio });
        }
      }

      if (Array.isArray(cp.skills) && cp.skills.length > 0) {
        const idx = next.findIndex((b) => b.type === "skills");
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            groups: [{ name: "Key Skills", keywords: cp.skills }],
          };
        } else {
          next.push({
            type: "skills",
            title: "Skills",
            groups: [{ name: "Key Skills", keywords: cp.skills }],
          });
        }
      }

      if (Array.isArray(cp.experiences) && cp.experiences.length > 0) {
        const expEntries = cp.experiences.map((e) => ({
          company: e.company || "",
          position: e.position || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          highlights: e.highlights || [],
          summary: (e.highlights || []).join("\n"),
        }));
        const idx = next.findIndex((b) => b.type === "work");
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            entries: expEntries,
          };
        } else {
          next.push({
            type: "work",
            title: "Experience",
            entries: expEntries,
          });
        }
      }

      if (Array.isArray(cp.education) && cp.education.length > 0) {
        const eduEntries = cp.education.map((edu) => ({
          institution: edu.institution || "",
          studyType: edu.degree || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        }));
        const idx = next.findIndex((b) => b.type === "education");
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            entries: eduEntries,
          };
        } else {
          next.push({
            type: "education",
            title: "Education",
            entries: eduEntries,
          });
        }
      }

      if (Array.isArray(cp.projects) && cp.projects.length > 0) {
        const projEntries = cp.projects.map((p) => ({
          name: p.name || "",
          description: p.description || "",
          technologies: p.technologies ? (Array.isArray(p.technologies) ? p.technologies : [p.technologies]) : [],
          url: p.url || "",
          highlights: p.description ? [p.description] : [],
        }));
        const idx = next.findIndex((b) => b.type === "projects");
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            entries: projEntries,
          };
        } else {
          next.push({
            type: "projects",
            title: "Projects",
            entries: projEntries,
          });
        }
      }

      return next;
    });

    setSaveStatus("unsaved");
    setAiPatchNotification("✅ Synced from Master Career Profile!");
    setTimeout(() => setAiPatchNotification(""), 3500);
  }, [user]);

  // Load parsed resume from upload into canvas
  const handleUploadParsedResume = useCallback((profile) => {
    if (!profile) return;

    // Normalize personal / basics
    const personal = profile.personal || profile.basics || {};
    const name = personal.fullName || personal.name || "";
    const label = personal.targetTitle || personal.label || "";
    const email = personal.email || "";
    const phone = personal.phone || "";
    const url = personal.website || personal.url || "";
    const city = typeof personal.location === "object" ? personal.location.city || "" : personal.location || "";
    const profiles = Array.isArray(personal.profiles)
      ? personal.profiles
      : [
          ...(personal.linkedin ? [{ network: "LinkedIn", url: personal.linkedin, username: personal.linkedin.split("/").filter(Boolean).pop() || "" }] : []),
          ...(personal.github ? [{ network: "GitHub", url: personal.github, username: personal.github.split("/").filter(Boolean).pop() || "" }] : []),
        ];

    setBasics((prev) => ({
      ...prev,
      name: name || prev.name || "",
      label: label || prev.label || "",
      email: email || prev.email || "",
      phone: phone || prev.phone || "",
      url: url || prev.url || "",
      location: {
        ...(prev.location || {}),
        city: city || prev.location?.city || "",
      },
      profiles: profiles.length > 0 ? profiles : prev.profiles || [],
    }));

    if (label || name) {
      setResumeName(`${name ? name + " - " : ""}${label || "Resume"}`);
    }

    const newBlocks = [TEMPLATES.header()];

    // Summary
    const summaryText = typeof profile.summary === "string" ? profile.summary : personal.summary || "";
    if (summaryText) {
      newBlocks.push({
        type: "summary",
        title: "Summary",
        content: summaryText,
      });
    }

    // Work Experience
    const rawWork = profile.workExperience || profile.work || [];
    if (Array.isArray(rawWork) && rawWork.length > 0) {
      newBlocks.push({
        type: "work",
        title: "Experience",
        entries: rawWork.map((w) => {
          const bullets = Array.isArray(w.bullets)
            ? w.bullets
            : Array.isArray(w.highlights)
              ? w.highlights
              : w.summary
                ? w.summary.split("\n").filter(Boolean)
                : [];
          return {
            company: w.company || "",
            position: w.role || w.position || w.title || "",
            startDate: w.startDate || "",
            endDate: w.endDate || "",
            highlights: bullets,
            summary: bullets.join("\n"),
          };
        }),
      });
    }

    // Education
    const rawEdu = profile.education || [];
    if (Array.isArray(rawEdu) && rawEdu.length > 0) {
      newBlocks.push({
        type: "education",
        title: "Education",
        entries: rawEdu.map((edu) => ({
          institution: edu.institution || "",
          studyType: edu.degree || edu.studyType || "",
          area: edu.area || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || edu.graduationYear || "",
          score: edu.score || edu.gpa || "",
          summary: edu.summary || "",
        })),
      });
    }

    // Skills
    let skillGroups = [];
    if (profile.skills) {
      if (Array.isArray(profile.skills)) {
        if (profile.skills.every((s) => typeof s === "string")) {
          skillGroups = [{ name: "Key Skills", keywords: profile.skills }];
        } else {
          skillGroups = profile.skills.map((s) => ({
            name: s.name || "Technical Skills",
            keywords: Array.isArray(s.keywords) ? s.keywords : Array.isArray(s.skills) ? s.skills : [],
          }));
        }
      } else if (typeof profile.skills === "object") {
        if (Array.isArray(profile.skills.technical) && profile.skills.technical.length > 0) {
          skillGroups.push({ name: "Technical Skills", keywords: profile.skills.technical });
        }
        if (Array.isArray(profile.skills.soft) && profile.skills.soft.length > 0) {
          skillGroups.push({ name: "Core Strengths", keywords: profile.skills.soft });
        }
        if (skillGroups.length === 0) {
          const flat = Object.values(profile.skills).flat().filter(Boolean);
          if (flat.length > 0) skillGroups.push({ name: "Key Skills", keywords: flat });
        }
      }
    }

    if (skillGroups.length > 0) {
      newBlocks.push({
        type: "skills",
        title: "Skills",
        groups: skillGroups,
      });
    }

    // Projects
    const rawProjects = profile.projects || [];
    if (Array.isArray(rawProjects) && rawProjects.length > 0) {
      newBlocks.push({
        type: "projects",
        title: "Projects",
        entries: rawProjects.map((p) => ({
          name: p.name || "",
          description: p.description || "",
          url: p.url || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
        })),
      });
    }

    setBlocks(newBlocks);
    setSaveStatus("unsaved");
    setAiPatchNotification("📄 Successfully extracted and loaded resume!");
    setTimeout(() => setAiPatchNotification(""), 4000);
  }, []);

  // Show choice modal for new resume sessions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id && !resumeId && !hasPromptedNewModal) {
      setHasPromptedNewModal(true);
      setShowNewResumeModal(true);
    }
  }, [resumeId, hasPromptedNewModal]);

  const [atsData, setAtsData] = useState({
    score: null,
    keywordScore: null,
    syntaxScore: null,
    impactScore: null,
    matchedKeywords: [],
    missingKeywords: [],
  });
  const [atsLoading, setAtsLoading] = useState(false);

  const saveTimeoutRef = useRef(null);

  // Strictly ATS-optimized templates — previous non-ATS templates removed
  const allTemplates = useMemo(() => {
    return BUILTIN_ATS_TEMPLATES;
  }, []);

  const selectedTemplate = useMemo(() => {
    const t = allTemplates.find(
      (t) => t.id === selectedTemplateId || t._id === selectedTemplateId,
    ) || ATS_CLASSIC_TEMPLATE;
    return {
      ...t,
      theme: {
        ...t.theme,
        colors: {
          ...(t.theme?.colors || {}),
          primary: activeThemeColor,
        },
      },
    };
  }, [allTemplates, selectedTemplateId, activeThemeColor]);

  const renderData = useMemo(
    () => composeResumeJson(blocks, basics),
    [blocks, basics, selectedTemplate],
  );

  const liveAts = useMemo(
    () => calculateAtsScore(renderData),
    [renderData],
  );

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get("/templates");
        setTemplates(response.data);
        if (location.state?.template) {
          const t = location.state.template;
          const tid = t.id || t._id;
          setSelectedTemplateId(tid);
          if (t.fontFamily) setActiveFont(t.fontFamily);
          if (t.theme?.colors?.primary) setActiveThemeColor(t.theme.colors.primary);
        } else {
          const first = response.data[0];
          setSelectedTemplateId(first?.id || first?._id || "ats-classic");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, [location.state]);

  const applyTemplate = useCallback(
    (templateId) => {
      const tpl = allTemplates.find(
        (t) => t.id === templateId || t._id === templateId,
      );
      if (!tpl) return;

      if (tpl.fontFamily) setActiveFont(tpl.fontFamily);
      if (tpl.theme?.colors?.primary) setActiveThemeColor(tpl.theme.colors.primary);

      setBlocks((currentBlocks) => {
        const getAllSectionIds = (sections = []) =>
          sections.flatMap((s) =>
            s.type === "sidebar" || s.type === "main"
              ? getAllSectionIds(s.sections)
              : s.id,
          );

        const templateSectionIds = getAllSectionIds(tpl.structure?.sections || []).filter(Boolean);

        // If template doesn't specify section IDs (e.g., standard ATS layout), preserve current blocks or initialize defaults
        if (templateSectionIds.length === 0) {
          if (currentBlocks.length > 0) return currentBlocks;
          return [
            TEMPLATES.header(),
            TEMPLATES.summary(),
            TEMPLATES.work(),
            TEMPLATES.education(),
            TEMPLATES.skills(),
            TEMPLATES.projects(),
          ];
        }

        const templateBlockTypes = templateSectionIds
          .map((id) =>
            Object.keys(blockTypeToResumeJsonSection).find(
              (key) => blockTypeToResumeJsonSection[key] === id,
            ),
          )
          .filter(Boolean);
        const currentBlockTypes = currentBlocks.map((b) => b.type);
        const combinedBlockTypes = [...templateBlockTypes];
        currentBlockTypes.forEach((type) => {
          if (!combinedBlockTypes.includes(type)) combinedBlockTypes.push(type);
        });

        const nextBlocks = combinedBlockTypes
          .map((blockType) => {
            const existingBlock = currentBlocks.find(
              (b) => b.type === blockType,
            );
            return (
              existingBlock ||
              (TEMPLATES[blockType] ? TEMPLATES[blockType]() : null)
            );
          })
          .filter(Boolean);

        if (!nextBlocks.some((b) => b.type === "summary")) {
          const existingSummary = currentBlocks.find(
            (b) => b.type === "summary",
          );
          nextBlocks.unshift(existingSummary || TEMPLATES.summary());
        }
        return nextBlocks;
      });
    },
    [allTemplates],
  );


  // Load existing resume
  useEffect(() => {
    const fetchResume = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) {
        if (templates.length > 0 && !resumeId) {
          applyTemplate(selectedTemplateId || templates[0]?._id);
          if (user?.careerProfile) {
            syncCareerProfile(user.careerProfile);
          }
        }
        return;
      }

      try {
        let resumeDataDoc = null;
        if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
          try {
            const { data } = await api.get(`/resumes/${encodeURIComponent(id)}`);
            resumeDataDoc = data;
          } catch (e) {
            console.warn("Backend fetch failed, checking local drafts...", e);
          }
        }
        if (!resumeDataDoc) {
          const drafts = JSON.parse(
            localStorage.getItem("resume_drafts") || "[]",
          );
          const foundDraft = drafts.find(
            (d) => String(d.id || d._id) === String(id),
          );
          if (foundDraft) {
            resumeDataDoc = foundDraft;
          }
        }

        if (resumeDataDoc) {
          const docBasics = resumeDataDoc.basics || resumeDataDoc.personalInfo || {};
          const linkedinProfile = (docBasics.profiles || []).find(
            (p) => p.network?.toLowerCase() === "linkedin",
          );
          const githubProfile = (docBasics.profiles || []).find(
            (p) => p.network?.toLowerCase() === "github",
          );
          const linkedin =
            docBasics.linkedin ||
            linkedinProfile?.username ||
            linkedinProfile?.url ||
            "";
          const github =
            docBasics.github ||
            githubProfile?.username ||
            githubProfile?.url ||
            "";

          setResumeName(resumeDataDoc.title || "Untitled Resume");
          setSelectedTemplateId(resumeDataDoc.templateId || templates[0]?.id);
          setTheme(resumeDataDoc.theme);
          setBasics((prev) => ({
            ...prev,
            ...docBasics,
            linkedin,
            github,
            location: {
              ...(prev.location || {}),
              ...(typeof docBasics.location === "string"
                ? { city: docBasics.location }
                : docBasics.location || {}),
            },
            profiles: docBasics.profiles || prev.profiles || [],
          }));
          setBlocks(resumeDataDoc.blocks || []);
          setResumeId(resumeDataDoc.id || resumeDataDoc._id);
          setSaveStatus("saved");
          setLastSavedAt(new Date(resumeDataDoc.updatedAt || Date.now()));
          return;
        }

        throw new Error("Resume not found");
      } catch (error) {
        console.error("Failed to fetch resume", error);
        alert(
          "Failed to load resume. A default template has been loaded instead.",
        );
        applyTemplate(selectedTemplateId);
      }
    };
    if (templates.length > 0) fetchResume();
  }, [templates]);

  // Save logic
  const onSave = async () => {
    setSaveStatus("saving");
    const tId =
      typeof selectedTemplateId === "string"
        ? selectedTemplateId
        : selectedTemplateId?._id || selectedTemplateId?.id || "ats-classic";

    const payload = {
      title: resumeName || "Untitled Resume",
      templateId: tId,
      theme,
      style: selectedTemplate?.style || {},
      blocks,
      basics,
      resumeData: renderData,
      atsScore: liveAts.score,
    };
    try {
      let resp;
      const isPersistentId =
        resumeId &&
        !String(resumeId).startsWith("draft_") &&
        /^[0-9a-fA-F]{24}$/.test(String(resumeId));

      if (isPersistentId) {
        resp = await api.put(
          `/resumes/${encodeURIComponent(resumeId)}`,
          payload,
        );
      } else {
        resp = await api.post("/resumes", payload);
      }
      const saved = resp?.data || {};
      const newId = saved?.id || saved?._id;
      if (newId) {
        const oldId = resumeId;
        setResumeId(newId);
        // Clean up old draft from local storage if applicable
        try {
          const drafts = JSON.parse(
            localStorage.getItem("resume_drafts") || "[]",
          );
          const filtered = drafts.filter(
            (d) =>
              String(d.id || d._id) !== String(oldId) &&
              String(d.id || d._id) !== String(newId),
          );
          localStorage.setItem("resume_drafts", JSON.stringify(filtered));
        } catch {}

        // Sync URL quietly
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("id") !== String(newId)) {
          currentUrl.searchParams.set("id", String(newId));
          window.history.replaceState({}, "", currentUrl.toString());
        }
      }

      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (e) {
      console.warn("Backend save failed:", e);
      try {
        const drafts = JSON.parse(
          localStorage.getItem("resume_drafts") || "[]",
        );
        const draft = {
          id: resumeId || `draft_${Date.now()}`,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        const idx = drafts.findIndex((d) => d.id === draft.id);
        if (idx >= 0) drafts[idx] = draft;
        else drafts.push(draft);
        localStorage.setItem("resume_drafts", JSON.stringify(drafts));
        setResumeId(draft.id);
        setLastSavedAt(new Date());
        setSaveStatus("saved");
      } catch {
        alert("Failed to save resume locally or to server.");
        setSaveStatus("unsaved");
      }
    }
  };

  const runAtsCheck = async () => {
    setAtsLoading(true);
    try {
      const response = await api.post("/ai/ats/check", { resumeData: renderData });
      setAtsData(response.data);
    } catch (error) {
      console.warn("Failed to run remote ATS check, falling back to client engine:", error);
      const clientAts = calculateAtsScore(renderData);
      setAtsData((prev) => ({
        ...prev,
        score: clientAts.score,
        keywordScore: Math.round((clientAts.breakdown.skillsScore / 15) * 100),
        syntaxScore: Math.round(((clientAts.breakdown.contactScore + clientAts.breakdown.sectionsScore) / 40) * 100),
        impactScore: Math.round(((clientAts.breakdown.metricsScore + clientAts.breakdown.actionVerbsScore) / 45) * 100),
      }));
    } finally {
      setAtsLoading(false);
    }
  };

  // Autosave
  useEffect(() => {
    if (saveStatus === "unsaved") {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSave();
      }, 3000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    blocks,
    basics,
    resumeName,
    selectedTemplateId,
    theme,
    activeFont,
    activeThemeColor,
  ]);

  // Block helpers
  const handleBasicsChange = useCallback((newBasics) => {
    setBasics(newBasics);
    setSaveStatus("unsaved");
  }, []);

  const updateBlock = useCallback((index, patch) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setSaveStatus("unsaved");
  }, []);

  const addBlock = useCallback(
    (type, atIndex = -1) => {
      if (BLOCK_CONFIG[type]?.singleton && blocks.some((b) => b.type === type))
        return;
      const tpl = TEMPLATES[type];
      if (!tpl) return;

      setBlocks((prev) => {
        const next = [...prev];
        if (atIndex >= 0) {
          next.splice(atIndex, 0, tpl());
        } else {
          next.push(tpl());
        }
        return next;
      });
      setSaveStatus("unsaved");
    },
    [blocks],
  );

  const removeBlock = useCallback((index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setSaveStatus("unsaved");
  }, []);

  const duplicateBlock = useCallback(
    (index) => {
      const block = blocks[index];
      if (block && BLOCK_CONFIG[block.type]?.singleton) {
        alert(`The "${block.title}" section can only be added once.`);
        return;
      }
      setBlocks((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, JSON.parse(JSON.stringify(prev[index])));
        return next;
      });
      setSaveStatus("unsaved");
    },
    [blocks],
  );

  const moveBlock = useCallback((from, to) => {
    setBlocks((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const item = next.splice(from, 1)[0];
      next.splice(to, 0, item);
      return next;
    });
    setSaveStatus("unsaved");
  }, []);

  // PDF Export
  const onDownloadPdf = async () => {
    setRendering(true);
    try {
      if (!selectedTemplate) {
        alert("Please select a template before exporting.");
        setRendering(false);
        return;
      }

      // Render the exact WYSIWYG editor canvas for 1:1 fidelity PDF export
      const html = ReactDOMServer.renderToStaticMarkup(
        <CanvasPrintRenderer
          blocks={blocks}
          basics={basics}
          template={selectedTemplate}
          activeFont={activeFont}
          activeThemeColor={activeThemeColor}
        />,
      );

      const payload = {
        engine: "puppeteer",
        html,
        templateId: selectedTemplateId,
        embedAtsJson: true,
        resumeData: renderData,
      };
      const response = await api.post("/resumes/export-pdf", payload, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resumeName || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      let msg = "Failed to generate PDF";
      if (e?.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          msg = json.message || msg;
        } catch {
          msg = e.message || msg;
        }
      } else {
        msg = e?.response?.data?.message || e?.message || msg;
      }
      alert(msg);
    } finally {
      setRendering(false);
    }
  };

  // AI Generators
  const onGenerateFull = async () => {
    setAiLoading(true);
    setAiLoadingSection({
      type: "full",
      label: "AI Copilot is generating a complete ATS resume...",
    });
    try {
      const { data } = await api.post("/ai", {
        scope: "full",
        prompt: aiPrompt,
        resumeData: renderData,
      });
      const generated = data?.resumeData || data || {};

      if (!generated || Object.keys(generated).length === 0) {
        alert(
          "The AI returned an empty response. Your current resume has been preserved.",
        );
        return;
      }

      const aiBasics = generated.basics || generated.personalInfo;
      if (aiBasics) {
        setBasics((prev) => {
          let location = prev.location;
          if (typeof aiBasics.location === "string") {
            location = { ...prev.location, city: aiBasics.location };
          } else if (
            aiBasics.location &&
            typeof aiBasics.location === "object"
          ) {
            location = { ...prev.location, ...aiBasics.location };
          }
          const linkedinProfile = (aiBasics.profiles || []).find(
            (p) => p.network?.toLowerCase() === "linkedin",
          );
          const githubProfile = (aiBasics.profiles || []).find(
            (p) => p.network?.toLowerCase() === "github",
          );
          const linkedin =
            aiBasics.linkedin ||
            linkedinProfile?.username ||
            linkedinProfile?.url ||
            prev.linkedin ||
            "";
          const github =
            aiBasics.github ||
            githubProfile?.username ||
            githubProfile?.url ||
            prev.github ||
            "";

          return {
            ...prev,
            ...aiBasics,
            linkedin,
            github,
            location,
            label: aiBasics.label || aiBasics.title || prev.label,
            profiles:
              Array.isArray(aiBasics.profiles) && aiBasics.profiles.length
                ? aiBasics.profiles
                : prev.profiles,
          };
        });
      }

      const generatedByType = {
        summary: generated?.basics?.summary
          ? {
              type: "summary",
              title: "Summary",
              content: generated.basics.summary,
            }
          : null,
        work:
          Array.isArray(generated?.work) && generated.work.length
            ? {
                type: "work",
                title: "Experience",
                entries: generated.work.map((w) => ({
                  company: w.company || w.name || "",
                  position: w.position || w.title || "",
                  startDate: w.startDate || "",
                  endDate: w.endDate || "",
                  summary: w.summary || "",
                  highlights: Array.isArray(w.highlights)
                    ? w.highlights
                    : Array.isArray(w.description)
                      ? w.description
                      : [],
                })),
              }
            : null,
        education:
          Array.isArray(generated?.education) && generated.education.length
            ? {
                type: "education",
                title: "Education",
                entries: generated.education.map((e) => ({
                  institution: e.institution || "",
                  studyType: e.studyType || e.degree || "",
                  area: e.area || "",
                  startDate: e.startDate || "",
                  endDate: e.endDate || "",
                  score: e.score || e.gpa || "",
                  summary: e.summary || "",
                })),
              }
            : null,
        skills:
          Array.isArray(generated?.skills) && generated.skills.length
            ? {
                type: "skills",
                title: "Skills",
                groups:
                  typeof generated.skills[0] === "string"
                    ? [
                        {
                          name: "Technical Skills",
                          level: "",
                          keywords: generated.skills.filter(Boolean),
                        },
                      ]
                    : generated.skills.map((s) => ({
                        name:
                          typeof s === "object"
                            ? s.name || "General"
                            : "General",
                        level: typeof s === "object" ? s.level || "" : "",
                        keywords: Array.isArray(s?.keywords)
                          ? s.keywords
                          : typeof s === "string"
                            ? [s]
                            : [],
                      })),
              }
            : null,
        projects:
          Array.isArray(generated?.projects) && generated.projects.length
            ? {
                type: "projects",
                title: "Projects",
                entries: generated.projects.map((p) => ({
                  name: p.name || "",
                  description: p.description || "",
                  url: p.url || "",
                  technologies: Array.isArray(p.technologies)
                    ? p.technologies
                    : [],
                })),
              }
            : null,
        awards:
          Array.isArray(generated?.awards) && generated.awards.length
            ? {
                type: "awards",
                title: "Awards",
                entries: generated.awards.map((a) => ({
                  title: a.title || a.name || "",
                  date: a.date || a.year || "",
                  awarder: a.awarder || a.issuer || "",
                  summary: a.summary || "",
                })),
              }
            : null,
        volunteer:
          Array.isArray(generated?.volunteer) && generated.volunteer.length
            ? {
                type: "volunteer",
                title: "Volunteer",
                entries: generated.volunteer.map((v) => ({
                  organization: v.organization || "",
                  position: v.position || "",
                  startDate: v.startDate || "",
                  endDate: v.endDate || "",
                  summary: v.summary || "",
                })),
              }
            : null,
        publications:
          Array.isArray(generated?.publications) &&
          generated.publications.length
            ? {
                type: "publications",
                title: "Publications",
                entries: generated.publications.map((p) => ({
                  name: p.name || "",
                  publisher: p.publisher || "",
                  releaseDate: p.releaseDate || "",
                  url: p.url || "",
                  summary: p.summary || "",
                })),
              }
            : null,
        languages:
          Array.isArray(generated?.languages) && generated.languages.length
            ? {
                type: "languages",
                title: "Languages",
                entries: generated.languages.map((l) => ({
                  language: l.language || "",
                  fluency: l.fluency || "",
                })),
              }
            : null,
        interests:
          Array.isArray(generated?.interests) && generated.interests.length
            ? {
                type: "interests",
                title: "Interests",
                entries: generated.interests.map((i) => ({
                  name: i.name || "",
                  keywords: Array.isArray(i.keywords) ? i.keywords : [],
                })),
              }
            : null,
      };

      const getAllSectionIds = (sections = []) =>
        sections.flatMap((s) =>
          s.type === "sidebar" || s.type === "main"
            ? getAllSectionIds(s.sections)
            : s.id,
        );

      const templateSectionIds = getAllSectionIds(
        selectedTemplate?.structure?.sections || []
      );
      
      const templateOrder = templateSectionIds
        .map((id) =>
          Object.keys(blockTypeToResumeJsonSection).find(
            (key) => blockTypeToResumeJsonSection[key] === id,
          ),
        )
        .filter(Boolean);

      const generatedKeys = Object.keys(generatedByType).filter(
        (k) => generatedByType[k] && k !== "header",
      );
      const order = [...new Set([...templateOrder, ...generatedKeys])];
      if (!order.includes("header")) {
        order.unshift("header");
      }

      const next = order
        .map((t) => {
          if (t === "header") return TEMPLATES.header();
          if (generatedByType[t]) return generatedByType[t];
          // Look for existing block first to preserve custom data that AI didn't overwrite
          const existingBlock = blocks.find((b) => b.type === t);
          if (existingBlock) return existingBlock;
          return TEMPLATES[t]?.();
        })
        .filter(Boolean);

      if (!next.some((b) => b.type === "summary") && generatedByType.summary) {
        const idxHeader = next.findIndex((b) => b.type === "header");
        next.splice(
          idxHeader >= 0 ? idxHeader + 1 : 0,
          0,
          generatedByType.summary,
        );
      }
      setBlocks(next);
      setSaveStatus("unsaved");
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate with AI",
      );
    } finally {
      setAiLoading(false);
      setAiLoadingSection(null);
    }
  };

  const onGenerateSummary = async () => {
    setAiLoading(true);
    setAiLoadingSection({
      type: "summary",
      label: "AI is writing your executive summary...",
    });
    try {
      const { data } = await api.post("/ai", {
        scope: "summary",
        prompt: aiPrompt,
        resumeData: {
          basics,
          work: renderData.experience || renderData.work,
          skills: renderData.skills,
        },
      });
      const summary = data?.summary || data?.basics?.summary || "";
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "summary");
        if (idx === -1)
          return [
            { type: "summary", title: "Summary", content: summary },
            ...prev,
          ];
        const next = [...prev];
        next[idx] = { ...next[idx], content: summary };
        return next;
      });
      setSaveStatus("unsaved");
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate summary",
      );
    } finally {
      setAiLoading(false);
      setAiLoadingSection(null);
    }
  };

  const onGenerateWorkBullets = async (blockIndex, entryIndex) => {
    setAiLoading(true);
    setAiLoadingSection({
      type: "work-entry",
      blockIndex,
      entryIndex,
      label: "AI is generating impact-driven bullets with metrics...",
    });
    try {
      const entry = blocks[blockIndex]?.entries?.[entryIndex];
      if (!entry) return;
      const existingBullets =
        Array.isArray(entry.highlights) && entry.highlights.length > 0
          ? entry.highlights
          : entry.summary
            ? entry.summary.split("\n").filter(Boolean)
            : [];

      const { data } = await api.post("/ai", {
        scope: "experience-item",
        prompt: aiPrompt || "Strengthen bullets with action verbs and realistic metrics grounded strictly in this role.",
        item: {
          company: entry.company,
          position: entry.position,
          highlights: existingBullets,
          summary: entry.summary || existingBullets.join("\n"),
          startDate: entry.startDate,
          endDate: entry.endDate,
        },
        resumeData: renderData,
      });

      let bullets = [];
      if (Array.isArray(data?.highlights) && data.highlights.length > 0) {
        bullets = data.highlights.map((h) => String(h).trim()).filter(Boolean);
      } else {
        const text = String(data?.summary || "").trim();
        bullets = text
          .split(/\r?\n|•|- |\u2022/g)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      setBlocks((prev) => {
        const next = [...prev];
        const nextEntries = [...next[blockIndex].entries];
        if (bullets.length > 0) {
          nextEntries[entryIndex] = {
            ...nextEntries[entryIndex],
            highlights: bullets,
            summary: bullets.join("\n"),
          };
        } else if (data?.summary) {
          nextEntries[entryIndex] = {
            ...nextEntries[entryIndex],
            summary: data.summary,
            highlights: data.summary.split("\n").filter(Boolean),
          };
        }
        next[blockIndex] = { ...next[blockIndex], entries: nextEntries };
        return next;
      });
      setSaveStatus("unsaved");
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate experience bullets",
      );
    } finally {
      setAiLoading(false);
      setAiLoadingSection(null);
    }
  };

  // 1-Click AI Fix for identified ATS weaknesses - 100% AI Assisted
  const handleAtsFix = async (part) => {
    if (!part) return;
    setFixingPartId(part.id);
    setAiLoading(true);
    setAiLoadingSection({
      type: part.fixScope || part.id,
      label: `AI is resolving "${part.title || part.issue || "deficiency"}"...`,
    });
    try {
      if (
        part.id === "placeholders" ||
        part.id === "email" ||
        part.id === "phone" ||
        part.id === "location" ||
        part.id === "links" ||
        part.fixScope === "header"
      ) {
        // AI Contact and Header Optimizer: cleans dummy data and derives ATS-compliant contact details
        const { data } = await api.post("/ai", {
          scope: "improve-header",
          deficiency: part.id,
          prompt: `Optimize and format candidate contact header for ATS parser compliance: resolve ${part.reason || part.suggestion || "Fix contact details and clear placeholders"}`,
          resumeData: renderData,
        });
        if (data?.basics) {
          setBasics((prev) => ({
            ...prev,
            ...data.basics,
            location: data.basics.location || prev.location,
          }));
          setSaveStatus("unsaved");
        }
      } else if (part.fixScope === "summary" || part.id === "summary") {
        // AI Professional Summary Writer
        const { data } = await api.post("/ai", {
          scope: "summary",
          prompt: `Write a high-impact, professional executive summary addressing ATS requirements: ${part.reason || part.suggestion || "Highlight core strengths and quantified achievements."}`,
          resumeData: renderData,
        });
        const summaryText = data?.summary || data?.basics?.summary || "";
        if (summaryText) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === "summary");
            if (idx === -1) {
              const headerIdx = prev.findIndex((b) => b.type === "header");
              const insertIdx = headerIdx !== -1 ? headerIdx + 1 : 0;
              const next = [...prev];
              next.splice(insertIdx, 0, {
                type: "summary",
                title: "Summary",
                content: summaryText,
              });
              return next;
            }
            const next = [...prev];
            next[idx] = { ...next[idx], content: summaryText };
            return next;
          });
          setBasics((b) => ({ ...b, summary: summaryText }));
          setSaveStatus("unsaved");
        }
      } else if (part.id === "work" && (!renderData.experience || renderData.experience.length < 2)) {
        // AI Experience Role Creator: generates realistic previous engagement leading into current title
        const targetTitle = basics.label ? `Associate ${basics.label}` : "Software Engineer";
        const { data } = await api.post("/ai", {
          scope: "experience-item",
          prompt: `Generate a realistic prior professional role or client engagement that logically precedes ${basics.label || "the current position"}, emphasizing technical deliverables, strong action verbs, and quantified metrics.`,
          item: {
            company: "Tech Systems Solutions",
            position: targetTitle,
            startDate: "2020",
            endDate: "2022",
          },
          resumeData: renderData,
        });
        const bullets = Array.isArray(data?.highlights) && data.highlights.length > 0
          ? data.highlights
          : [
              "Engineered core system features delivering 25% efficiency improvements across key modules.",
              "Collaborated with cross-functional stakeholders to deliver project milestones on schedule.",
            ];
        const newRole = {
          company: "Tech Systems Solutions",
          position: targetTitle,
          startDate: "2020",
          endDate: "2022",
          highlights: bullets,
          summary: bullets.join("\n"),
        };
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.type === "work");
          if (idx === -1) {
            return [...prev, { type: "work", title: "Experience", entries: [newRole] }];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            entries: [...(next[idx].entries || []), newRole],
          };
          return next;
        });
        setSaveStatus("unsaved");
      } else if (part.fixScope === "work" || part.id === "metrics" || part.id === "verbs") {
        // AI Experience Bullet Enricher: quantifies with metrics and action verbs
        const workBlock = blocks.find((b) => b.type === "work");
        if (workBlock) {
          const { data } = await api.post("/ai", {
            scope: "improve-section",
            sectionType: "work",
            block: workBlock,
            prompt: `Enrich experience bullets with strong action verbs and quantified impact metrics: ${part.reason || part.suggestion || "Add quantifiable %, $, numbers"}`,
            resumeData: renderData,
          });
          if (data?.improvedBlock?.entries) {
            const enrichedEntries = data.improvedBlock.entries.map((entry) => {
              const bullets =
                Array.isArray(entry.highlights) && entry.highlights.length > 0
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
            setBlocks((prev) => {
              const idx = prev.findIndex((b) => b.type === "work");
              if (idx === -1) return prev;
              const next = [...prev];
              next[idx] = { ...next[idx], entries: enrichedEntries };
              return next;
            });
            setSaveStatus("unsaved");
          }
        }
      } else if (part.fixScope === "education" || part.id === "education") {
        // AI Education Credential Generator
        const { data } = await api.post("/ai", {
          scope: "education",
          prompt: `Generate an authentic higher education degree credential that specifically aligns with ${basics.label || "candidate domain"}`,
          resumeData: renderData,
        });
        const eduEntries = Array.isArray(data?.education) && data.education.length > 0
          ? data.education
          : [
              {
                institution: "University of Technology",
                studyType: "Bachelor of Science",
                area: basics.label || "Computer Science",
                startDate: "2018",
                endDate: "2022",
                score: "",
                summary: "",
              },
            ];
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.type === "education");
          if (idx === -1) {
            return [
              ...prev,
              {
                type: "education",
                title: "Education",
                entries: eduEntries,
              },
            ];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            entries: eduEntries,
          };
          return next;
        });
        setSaveStatus("unsaved");
      } else if (part.fixScope === "skills" || part.id === "skills") {
        // AI Skill Keywords Specialist
        const { data } = await api.post("/ai", {
          scope: "skills-suggest",
          roleTitle: basics.label || "Professional",
          currentSkills: renderData.skills || [],
          prompt: `Provide crucial in-demand ATS skills to resolve: ${part.reason || part.suggestion}. Target keywords: ${(part.targetKeywords || []).join(", ")}`,
          resumeData: renderData,
        });
        const newSkills = Array.isArray(data?.skills) ? data.skills : [];
        if (newSkills.length > 0) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === "skills");
            if (idx === -1) {
              return [
                ...prev,
                {
                  type: "skills",
                  title: "Skills",
                  groups: [{ name: "Core Competencies", keywords: newSkills }],
                },
              ];
            }
            const next = [...prev];
            const currentGroups = next[idx].groups || [];
            if (currentGroups.length === 0) {
              next[idx] = {
                ...next[idx],
                groups: [{ name: "Core Competencies", keywords: newSkills }],
              };
            } else {
              const firstGroup = currentGroups[0];
              const existingKw = new Set(firstGroup.keywords || []);
              newSkills.forEach((k) => existingKw.add(k));
              const updatedGroups = [...currentGroups];
              updatedGroups[0] = { ...firstGroup, keywords: Array.from(existingKw) };
              next[idx] = { ...next[idx], groups: updatedGroups };
            }
            return next;
          });
          setSaveStatus("unsaved");
        }
      } else {
        const { data } = await api.post("/ai", {
          scope: "improve-section",
          sectionType: part.fixScope || "general",
          prompt: `Fix resume deficiency: ${part.reason || part.issue}. Recommendation: ${part.suggestion}`,
          resumeData: renderData,
        });
        if (data?.improvedBlock) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === data.improvedBlock.type);
            if (idx === -1) {
              return [...prev, data.improvedBlock];
            }
            const next = [...prev];
            next[idx] = { ...next[idx], ...data.improvedBlock };
            return next;
          });
          setSaveStatus("unsaved");
        }
      }
    } catch (err) {
      console.error("Failed to fix ATS issue with AI:", err);
      alert(err?.response?.data?.message || err.message || "Failed to fix issue with AI");
    } finally {
      setFixingPartId(null);
      setAiLoading(false);
      setAiLoadingSection(null);
    }
  };



  // Section-specific AI Assist button handler
  const handleAiAssistSection = async (block, blockIndex) => {
    if (!block) return;
    setAiLoading(true);
    setAiLoadingSection({
      type: block.type,
      blockIndex,
      label: `AI is optimizing your ${block.title || block.type} section...`,
    });
    try {
      if (block.type === "summary") {
        const { data } = await api.post("/ai", {
          scope: "summary",
          prompt: aiPrompt || "Polish, tighten, and elevate this professional summary for maximum ATS recruiter appeal and executive clarity.",
          resumeData: renderData,
        });
        const summary = data?.summary || data?.basics?.summary || "";
        if (summary) {
          setBlocks((prev) => {
            const next = [...prev];
            next[blockIndex] = { ...next[blockIndex], content: summary };
            return next;
          });
          setSaveStatus("unsaved");
        }
      } else if (block.type === "skills") {
        const { data } = await api.post("/ai", {
          scope: "skills-suggest",
          roleTitle: basics.label || "Professional",
          currentSkills: renderData.skills || [],
          prompt: aiPrompt || "Suggest top in-demand technical competencies and tools for this role.",
          resumeData: renderData,
        });
        const suggested = Array.isArray(data?.skills) ? data.skills : [];
        if (suggested.length > 0) {
          setBlocks((prev) => {
            const next = [...prev];
            const currentGroups = next[blockIndex].groups || [];
            if (currentGroups.length === 0) {
              next[blockIndex] = {
                ...next[blockIndex],
                groups: [{ name: "Technical Skills", keywords: suggested }],
              };
            } else {
              const updatedGroups = [...currentGroups];
              const kwSet = new Set(updatedGroups[0].keywords || []);
              suggested.forEach((s) => kwSet.add(s));
              updatedGroups[0] = { ...updatedGroups[0], keywords: Array.from(kwSet) };
              next[blockIndex] = { ...next[blockIndex], groups: updatedGroups };
            }
            return next;
          });
          setSaveStatus("unsaved");
        }
      } else {
        const { data } = await api.post("/ai", {
          scope: "improve-section",
          sectionType: block.type,
          block,
          prompt: aiPrompt || `Elevate this ${block.title || block.type} section with strong action verbs, quantifiable metrics, and clear impact.`,
          resumeData: renderData,
        });
        if (data?.improvedBlock) {
          const improved = { ...data.improvedBlock };
          if (Array.isArray(improved.entries)) {
            improved.entries = improved.entries.map((entry) => {
              const bullets =
                Array.isArray(entry.highlights) && entry.highlights.length > 0
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
          setBlocks((prev) => {
            const next = [...prev];
            next[blockIndex] = { ...next[blockIndex], ...improved };
            return next;
          });
          setSaveStatus("unsaved");
        }
      }
    } catch (err) {
      console.error("AI section assist error:", err);
      alert(err?.response?.data?.message || err.message || "Failed to assist section with AI");
    } finally {
      setAiLoading(false);
      setAiLoadingSection(null);
    }
  };

  // Apply patch from Conversational AI Assistant
  const handleApplyAiPatch = (rawPatch) => {
    if (!rawPatch) return;
    const patch = rawPatch.patch || rawPatch;

    // 1. Summary
    const summaryText =
      patch.summary ||
      patch.basics?.summary ||
      (patch.field === "summary" ? (typeof patch.content === "string" ? patch.content : patch.summary) : "");

    if (summaryText && typeof summaryText === "string") {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "summary");
        if (idx === -1) {
          const headerIdx = prev.findIndex((b) => b.type === "header");
          const insertIdx = headerIdx !== -1 ? headerIdx + 1 : 0;
          const next = [...prev];
          next.splice(insertIdx, 0, { type: "summary", title: "Summary", content: summaryText });
          return next;
        }
        const next = [...prev];
        next[idx] = { ...next[idx], content: summaryText };
        return next;
      });
      setBasics((b) => ({ ...b, summary: summaryText }));
    }

    // 2. Basics / Header Info
    const basicsPatch = patch.basics || (patch.field === "basics" && typeof patch.content === "object" ? patch.content : null);
    if (basicsPatch && typeof basicsPatch === "object") {
      setBasics((prev) => ({
        ...prev,
        ...basicsPatch,
        location: {
          ...(prev.location || {}),
          ...(typeof basicsPatch.location === "object" ? basicsPatch.location : { city: basicsPatch.location || prev.location?.city || "" }),
        },
      }));
    }

    // 3. Skills
    const skillsList = Array.isArray(patch.skills)
      ? patch.skills
      : Array.isArray(patch.keywords)
        ? patch.keywords
        : patch.field === "skills"
          ? (Array.isArray(patch.content) ? patch.content : Array.isArray(patch.keywords) ? patch.keywords : [patch.content].filter(Boolean))
          : null;

    if (skillsList && skillsList.length > 0) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "skills");
        if (idx === -1) {
          return [
            ...prev,
            {
              type: "skills",
              title: "Skills",
              groups: [{ name: "Key Skills", keywords: skillsList }],
            },
          ];
        }
        const next = [...prev];
        const groups = next[idx].groups || [];
        if (groups.length === 0) {
          next[idx] = {
            ...next[idx],
            groups: [{ name: "Key Skills", keywords: skillsList }],
          };
        } else {
          const nextGroups = [...groups];
          const existing = new Set(nextGroups[0].keywords || []);
          skillsList.forEach((k) => existing.add(k));
          nextGroups[0] = { ...nextGroups[0], keywords: Array.from(existing) };
          next[idx] = { ...next[idx], groups: nextGroups };
        }
        return next;
      });
    }

    // 4. Work Experience
    const rawWork =
      patch.work ||
      patch.entries ||
      patch.experience ||
      (patch.field === "work" ? (Array.isArray(patch.content) ? patch.content : patch.entries) : null);

    const workList = Array.isArray(rawWork)
      ? rawWork
      : rawWork && typeof rawWork === "object"
        ? [rawWork]
        : null;

    if (workList && workList.length > 0) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "work");
        if (idx === -1) {
          return [
            ...prev,
            {
              type: "work",
              title: "Experience",
              entries: workList.map((w) => {
                const bullets =
                  Array.isArray(w.highlights) && w.highlights.length > 0
                    ? w.highlights
                    : Array.isArray(w.description)
                      ? w.description
                      : w.summary
                        ? w.summary.split("\n").filter(Boolean)
                        : [];
                return {
                  company: w.company || "",
                  position: w.position || w.title || "",
                  startDate: w.startDate || "",
                  endDate: w.endDate || "",
                  highlights: bullets,
                  summary: bullets.join("\n"),
                };
              }),
            },
          ];
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          entries: workList.map((w) => {
            const bullets =
              Array.isArray(w.highlights) && w.highlights.length > 0
                ? w.highlights
                : Array.isArray(w.description)
                  ? w.description
                  : w.summary
                    ? w.summary.split("\n").filter(Boolean)
                    : [];
            return {
              company: w.company || "",
              position: w.position || w.title || "",
              startDate: w.startDate || "",
              endDate: w.endDate || "",
              highlights: bullets,
              summary: bullets.join("\n"),
            };
          }),
        };
        return next;
      });
    }

    // 5. Projects
    const projectsList = Array.isArray(patch.projects)
      ? patch.projects
      : patch.field === "projects" && Array.isArray(patch.content)
        ? patch.content
        : null;

    if (projectsList && projectsList.length > 0) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "projects");
        if (idx === -1) {
          return [
            ...prev,
            {
              type: "projects",
              title: "Projects",
              entries: projectsList.map((p) => ({
                name: p.name || p.title || "",
                description: p.description || (Array.isArray(p.highlights) ? p.highlights.join("\n") : ""),
                technologies: p.technologies || p.tech || [],
                url: p.url || "",
              })),
            },
          ];
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          entries: projectsList.map((p) => ({
            name: p.name || p.title || "",
            description: p.description || (Array.isArray(p.highlights) ? p.highlights.join("\n") : ""),
            technologies: p.technologies || p.tech || [],
            url: p.url || "",
          })),
        };
        return next;
      });
    }

    setSaveStatus("unsaved");
    setAiPatchNotification("✅ Applied AI changes to your resume canvas!");
    setTimeout(() => setAiPatchNotification(""), 3500);
  };

  // 1-Click Action Envelope Handler for AI Co-Pilot Proposals
  const handleApplyActionEnvelope = (actionName, payload) => {
    if (!payload) return;

    switch (actionName) {
      case "setContactInfo": {
        const p = payload;
        const newName = p.fullName || p.name || "";
        const newLabel = p.targetTitle || p.role || p.title || p.label || "";
        const city = typeof p.location === "object" ? p.location.city || "" : p.location || "";
        const newProfiles = [
          ...(p.linkedin ? [{ network: "LinkedIn", url: p.linkedin, username: p.linkedin.split("/").filter(Boolean).pop() || "" }] : []),
          ...(p.github ? [{ network: "GitHub", url: p.github, username: p.github.split("/").filter(Boolean).pop() || "" }] : []),
        ];

        setBasics((prev) => ({
          ...prev,
          name: newName || prev.name || "",
          email: p.email || prev.email || "",
          phone: p.phone || prev.phone || "",
          label: newLabel || prev.label || "",
          url: p.website || p.url || prev.url || "",
          location: {
            ...(prev.location || {}),
            city: city || prev.location?.city || "",
          },
          profiles: newProfiles.length > 0 ? newProfiles : prev.profiles || [],
        }));

        if (newLabel || newName) {
          setResumeName(`${newName ? newName + " - " : ""}${newLabel || newName} Resume`);
        }
        setAiPatchNotification("✅ Applied contact info to resume!");
        break;
      }

      case "updateSummary": {
        const summaryText = typeof payload === "string" ? payload : payload.summary || payload.text || payload.bio || "";
        if (summaryText) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === "summary");
            if (idx === -1) {
              const headerIdx = prev.findIndex((b) => b.type === "header");
              const insertIdx = headerIdx !== -1 ? headerIdx + 1 : 0;
              const next = [...prev];
              next.splice(insertIdx, 0, { type: "summary", title: "Summary", content: summaryText });
              return next;
            }
            const next = [...prev];
            next[idx] = { ...next[idx], content: summaryText };
            return next;
          });
          setBasics((b) => ({ ...b, summary: summaryText }));
          setAiPatchNotification("✅ Applied professional summary to resume!");
        }
        break;
      }

      case "addExperience": {
        const exp = payload;
        const bullets = Array.isArray(exp.bullets)
          ? exp.bullets
          : Array.isArray(exp.highlights)
            ? exp.highlights
            : exp.summary
              ? exp.summary.split("\n").filter(Boolean)
              : [];

        const rawDates = exp.dates || exp.duration || "";
        const dateParts = typeof rawDates === "string" ? rawDates.split(/[-–—]/) : [];
        const start = exp.startDate || (dateParts[0] ? dateParts[0].trim() : "");
        const end = exp.endDate || (dateParts[1] ? dateParts[1].trim() : (dateParts.length === 1 ? dateParts[0].trim() : ""));

        const newEntry = {
          company: exp.company || "",
          position: exp.role || exp.position || exp.title || "",
          startDate: start,
          endDate: end,
          highlights: bullets,
          summary: bullets.join("\n"),
        };

        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.type === "work");
          if (idx === -1) {
            return [
              ...prev,
              {
                type: "work",
                title: "Experience",
                entries: [newEntry],
              },
            ];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            entries: [...(next[idx].entries || []), newEntry],
          };
          return next;
        });
        setAiPatchNotification(`✅ Added ${exp.role || exp.company || "experience"} to resume!`);
        break;
      }

      case "updateSkills": {
        let groupsToApply = [];
        if (payload.technical || payload.tools || payload.soft) {
          if (Array.isArray(payload.technical) && payload.technical.length > 0) {
            groupsToApply.push({ name: "Technical Skills", keywords: payload.technical });
          }
          if (Array.isArray(payload.tools) && payload.tools.length > 0) {
            groupsToApply.push({ name: "Tools & Frameworks", keywords: payload.tools });
          }
          if (Array.isArray(payload.soft) && payload.soft.length > 0) {
            groupsToApply.push({ name: "Core Strengths", keywords: payload.soft });
          }
        } else if (Array.isArray(payload.categories)) {
          groupsToApply = payload.categories.map((c) => ({
            name: c.category || c.name || "Skills",
            keywords: Array.isArray(c.skills) ? c.skills : Array.isArray(c.keywords) ? c.keywords : [],
          }));
        } else {
          const raw = payload.skills || payload.keywords || payload;
          const flat = Array.isArray(raw)
            ? raw
            : typeof raw === "string"
              ? raw.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
          if (flat.length > 0) {
            groupsToApply.push({ name: "Key Skills", keywords: flat });
          }
        }

        if (groupsToApply.length > 0) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === "skills");
            if (idx === -1) {
              return [
                ...prev,
                {
                  type: "skills",
                  title: "Skills",
                  groups: groupsToApply,
                },
              ];
            }
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              groups: groupsToApply,
            };
            return next;
          });
          setAiPatchNotification("✅ Updated skills on resume!");
        }
        break;
      }

      case "addProject": {
        const proj = payload;
        const newProj = {
          name: proj.name || proj.title || "",
          description: proj.description || (Array.isArray(proj.highlights) ? proj.highlights.join("\n") : ""),
          technologies: Array.isArray(proj.technologies) ? proj.technologies : (proj.technologies ? [proj.technologies] : []),
          url: proj.url || proj.link || "",
          highlights: Array.isArray(proj.highlights) ? proj.highlights : (proj.description ? [proj.description] : []),
        };
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.type === "projects");
          if (idx === -1) {
            return [
              ...prev,
              {
                type: "projects",
                title: "Projects",
                entries: [newProj],
              },
            ];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            entries: [...(next[idx].entries || []), newProj],
          };
          return next;
        });
        setAiPatchNotification(`✅ Added ${proj.name || "project"} to resume!`);
        break;
      }

      case "addEducation": {
        const edu = payload;
        const newEdu = {
          institution: edu.institution || edu.school || "",
          studyType: edu.degree || edu.studyType || "",
          area: edu.major || edu.area || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || edu.dates || "",
          score: edu.score || edu.gpa || "",
          summary: edu.summary || "",
        };
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.type === "education");
          if (idx === -1) {
            return [
              ...prev,
              {
                type: "education",
                title: "Education",
                entries: [newEdu],
              },
            ];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            entries: [...(next[idx].entries || []), newEdu],
          };
          return next;
        });
        setAiPatchNotification(`✅ Added education to resume!`);
        break;
      }

      case "generateResume": {
        if (payload && typeof payload === "object" && (payload.work || payload.workExperience || payload.personal || payload.basics)) {
          handleUploadParsedResume(payload);
        } else if (payload?.template) {
          applyTemplate(payload.template);
        }
        setAiPatchNotification("✅ Applied full resume generation to canvas!");
        break;
      }

      default:
        handleApplyAiPatch(payload);
        break;
    }

    setSaveStatus("unsaved");
    setTimeout(() => setAiPatchNotification(""), 3500);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-bg-base font-sans overflow-hidden">
      <EditorTopBar
        resumeName={resumeName}
        onResumeNameChange={(v) => {
          setResumeName(v);
          setSaveStatus("unsaved");
        }}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onSave={onSave}
        onDownloadPdf={onDownloadPdf}
        rendering={rendering}
        atsScore={liveAts.score}
        onToggleAtsDrawer={() => {
          if (!showAtsDrawer && atsData.matchedKeywords.length === 0 && !atsLoading) {
            runAtsCheck();
          }
          setShowAtsDrawer((prev) => {
            const next = !prev;
            if (next) setShowAiAssistant(false);
            return next;
          });
        }}
        showAiAssistant={showAiAssistant}
        onToggleAiAssistant={() => {
          setShowAiAssistant((prev) => {
            const next = !prev;
            if (next) setShowAtsDrawer(false);
            return next;
          });
        }}
        onSyncCareerProfile={() => syncCareerProfile()}
        onBackToDashboard={() => navigate("/Dashboard")}
      />

      {/* Floating AI Progress Banner */}
      {aiLoading && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-medium text-xs rounded-full shadow-2xl border border-purple-400/40 animate-pulse backdrop-blur-md">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-300 animate-ping" />
          <span>{aiLoadingSection?.label || "AI Copilot is generating and enriching your resume..."}</span>
        </div>
      )}

      {/* Floating Toast when AI Patch is Applied */}
      {aiPatchNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-2xl border border-emerald-400/40 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{aiPatchNotification}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <EditorSidebar
          activeTab={activeRailTab}
          onTabChange={setActiveRailTab}
          blocks={blocks}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          templates={allTemplates}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={(id) => {
            setSelectedTemplateId(id);
            applyTemplate(id);
            setSaveStatus("unsaved");
          }}
          activeFont={activeFont}
          onFontChange={setActiveFont}
          activeThemeColor={activeThemeColor}
          onThemeColorChange={setActiveThemeColor}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onGenerateFull={onGenerateFull}
          onGenerateSummary={onGenerateSummary}
          aiLoading={aiLoading}
          aiPrompt={aiPrompt}
          onAiPromptChange={setAiPrompt}
        />

        <EditorCanvas
          blocks={blocks}
          basics={basics}
          template={selectedTemplate}
          onBasicsChange={handleBasicsChange}
          onUpdateBlock={updateBlock}
          onMoveBlock={moveBlock}
          onDuplicateBlock={duplicateBlock}
          onRemoveBlock={removeBlock}
          onAddBlock={addBlock}
          onGenerateBullets={onGenerateWorkBullets}
          onAiAssistSection={handleAiAssistSection}
          aiLoading={aiLoading}
          aiLoadingSection={aiLoadingSection}
          zoomLevel={zoomLevel}
          activeFont={activeFont}
          activeThemeColor={activeThemeColor}
        />

        {showAiAssistant && (
          <AiAssistantDrawer
            isOpen={showAiAssistant}
            onClose={() => setShowAiAssistant(false)}
            resumeData={renderData}
            onApplyPatch={handleApplyAiPatch}
            onApplyActionEnvelope={handleApplyActionEnvelope}
          />
        )}

        {showAtsDrawer && (
          <AtsCopilotDrawer
            isOpen={showAtsDrawer}
            onClose={() => setShowAtsDrawer(false)}
            score={liveAts.score}
            keywordScore={atsData.keywordScore ?? Math.round((liveAts.breakdown.skillsScore / 15) * 100)}
            syntaxScore={atsData.syntaxScore ?? Math.round(((liveAts.breakdown.contactScore + liveAts.breakdown.sectionsScore) / 40) * 100)}
            impactScore={atsData.impactScore ?? Math.round(((liveAts.breakdown.metricsScore + liveAts.breakdown.actionVerbsScore) / 45) * 100)}
            matchedKeywords={atsData.matchedKeywords || []}
            missingKeywords={atsData.missingKeywords || []}
            goodParts={liveAts.goodParts || []}
            badParts={liveAts.badParts || []}
            onFixIssue={handleAtsFix}
            fixingPartId={fixingPartId}
            onAddKeyword={(kw) => alert(`Added keyword: ${kw}`)}
            loading={atsLoading}
          />
        )}
      </div>

      <NewResumeModal
        isOpen={showNewResumeModal}
        onClose={() => setShowNewResumeModal(false)}
        careerProfile={user?.careerProfile}
        onSelectCareerProfile={() => {
          if (user?.careerProfile) {
            syncCareerProfile(user.careerProfile);
          } else {
            setAiPatchNotification("⚠️ No CareerOps profile set yet. Go to Settings > CareerOps!");
            setTimeout(() => setAiPatchNotification(""), 4000);
          }
          setShowNewResumeModal(false);
        }}
        onUploadParsed={(parsed) => {
          handleUploadParsedResume(parsed);
          setShowNewResumeModal(false);
        }}
        onStartAiCopilot={() => {
          setShowNewResumeModal(false);
          setShowAiAssistant(true);
        }}
        onStartBlank={() => {
          applyTemplate(selectedTemplateId || "ats-classic");
          setShowNewResumeModal(false);
        }}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(data) => {
          setShowOnboarding(false);
          if (data?.roleTitle) {
            setResumeName(`${data.roleTitle} Resume`);
            setBasics((b) => ({ ...b, label: data.roleTitle }));
          }
        }}
      />
    </div>
  );
}
