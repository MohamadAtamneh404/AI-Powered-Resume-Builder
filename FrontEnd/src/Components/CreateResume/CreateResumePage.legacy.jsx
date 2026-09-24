import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";
import {
  SectionCard,
  ResumePreviewPanel,
  BlockToolbar,
  AtsScoreBadge,
  AiSuggestionPopover,
  AtsCopilotDrawer,
} from "./EditorUI";
import OnboardingModal from "./OnboardingModal";
import ResumeRenderer, {
  AtsClassicRenderer,
} from "../ResumeTemplates/ResumeRenderer"; // React renderer
import ReactDOMServer from "react-dom/server";

// Small UI helpers
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-zinc-700 font-medium mb-1 font-mono">
        {label}
      </label>
      {children}
    </div>
  );
}

function SmallField({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-zinc-700 font-medium mb-1 font-mono">
        {label}
      </label>
      {children}
    </div>
  );
}

function timeAgo(date) {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "just now";
  }
}

// Map template section type to internal block type
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

export const ATS_CLASSIC_TEMPLATE = {
  id: "ats-classic",
  name: "ATS Classic",
  category: "ATS Friendly",
  description:
    "100% ATS-optimized single-column layout for maximum parser pass rates.",
  isAts: true,
  theme: {
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#4f46e5",
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
};

// Block templates
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
      {
        name: "Frameworks & Libraries",
        level: "",
        keywords: ["React", "Node.js", "Next.js", "GraphQL"],
      },
      {
        name: "Tools & Platforms",
        level: "",
        keywords: ["Git", "Docker", "AWS", "PostgreSQL"],
      },
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

// Defines which blocks can only be added once
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

// Compose JSON Resume for ResumeRenderer
function composeResumeJson(blocks, basics, template) {
  const isCreative = template?.id === "creative-bold";

  // The creative-bold template uses a different data schema.
  // We will build the appropriate structure based on the selected template.

  const resumeData = {
    personalInfo: {
      name: basics.name || "",
      title: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: basics.location?.city || "",
      website: basics.url || "",
      linkedin:
        (basics.profiles || []).find(
          (p) => p.network?.toLowerCase() === "linkedin",
        )?.username || "",
      github:
        (basics.profiles || []).find(
          (p) => p.network?.toLowerCase() === "github",
        )?.username || "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    awards: [],
    certifications: [], // For compatibility with creative template
    volunteer: [],
    publications: [],
    languages: [],
    interests: [],
  };

  // If it's the creative template, create the 'basics' and 'work' properties it expects.
  if (isCreative) {
    resumeData.basics = {
      name: basics.name || "",
      label: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: basics.location?.city || "",
      summary: "", // will be populated below
    };
    // It expects 'work' instead of 'experience'
    resumeData.work = [];
  }

  blocks.forEach((block) => {
    if (!block || !block.type) return;

    switch (block.type) {
      case "summary":
        resumeData.personalInfo.summary = block.content || "";
        break;
      case "work": {
        const experienceData = (block.entries || []).map((entry) => ({
          company: entry.company || "",
          title: entry.position || "",
          location: entry.location || "",
          startDate: entry.startDate || "",
          endDate: entry.endDate || "",
          description: entry.summary
            ? entry.summary.split("\n").filter(Boolean)
            : entry.highlights || [],
        }));

        // Assign to the correct property based on the template
        if (isCreative) {
          resumeData.work = experienceData;
          // Also update the summary in the correct nested object for creative template
          if (resumeData.basics) {
            resumeData.basics.summary = resumeData.personalInfo.summary;
          }
        } else {
          resumeData.experience = experienceData;
        }
        break;
      }
      case "education":
        resumeData.education = (block.entries || []).map((entry) => ({
          institution: entry.institution || "",
          degree: entry.studyType || "",
          area: entry.area || "",
          startDate: entry.startDate || "",
          endDate: entry.endDate || "",
          year: entry.endDate || "", // Keep for backward compatibility
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
      case "awards": {
        const awardsData = (block.entries || []).map((a) => ({
          title: a.title || "",
          date: a.date || "",
          awarder: a.awarder || "",
          summary: a.summary || "",
        }));
        // Map to both for compatibility
        resumeData.awards = awardsData;
        resumeData.certifications = awardsData.map((a) => ({
          name: a.title,
          year: a.date,
          issuer: a.awarder,
        }));
        break;
      }
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

// Provides default template structures for sections that might be added by the user
// but are not present in the original selected template. This makes the renderer dynamic.
const DEFAULT_SECTION_TEMPLATES = {
  projects: {
    id: "projects",
    type: "repeatable-section",
    showTitle: true,
    title: "Projects",
    dataPath: "projects",
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
        dataPath: "name",
        style: { fontSize: "18px", fontWeight: "bold" },
      },
      {
        type: "text",
        dataPath: "description",
        style: { marginTop: "4px", marginBottom: "8px" },
      },
      {
        type: "tag-list",
        dataPath: "technologies",
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

export default function CreateResumePage() {
  const location = useLocation();
  const [resumeName, setResumeName] = useState("New Resume");

  // Basics used by Header and renderer
  const [basics, setBasics] = useState({
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    location: { city: "", region: "", countryCode: "" },
    profiles: [],
  });

  // Template selection
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("ats-classic");

  const allTemplates = useMemo(() => {
    const list = [ATS_CLASSIC_TEMPLATE];
    templates.forEach((t) => {
      if (t.id !== "ats-classic" && t._id !== "ats-classic") {
        list.push(t);
      }
    });
    return list;
  }, [templates]);

  const selectedTemplate = useMemo(
    () =>
      allTemplates.find(
        (t) => t.id === selectedTemplateId || t._id === selectedTemplateId,
      ) || ATS_CLASSIC_TEMPLATE,
    [allTemplates, selectedTemplateId],
  );

  // Enhancv & ATS workspace state
  const [mobileTab, setMobileTab] = useState("edit"); // "edit" | "preview"
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeRailTab, setActiveRailTab] = useState("templates");
  const [railDrawerOpen, setRailDrawerOpen] = useState(false);
  const [activeFont, setActiveFont] = useState("Inter");
  const [activeThemeColor, setActiveThemeColor] = useState("#4f46e5");
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);

  // AI Keyword Optimizer popover state
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false);
  const [aiSuggestedSummary, setAiSuggestedSummary] = useState(
    "Results-driven Senior Software Engineer with 8+ years of expertise designing and deploying scalable web architectures. Proven track record in spearheading frontend initiatives, seamlessly integrating AI solutions, and mentoring cross-functional teams to exceed product delivery goals.",
  );

  // Blocks (created from template)
  const [blocks, setBlocks] = useState([]);

  // Preview/theme
  const [theme, setTheme] = useState("minimal");
  const [previewHtml, setPreviewHtml] = useState("");
  const [rendering, setRendering] = useState(false);
  const [pdfEngine, setPdfEngine] = useState("puppeteer"); // Add state for PDF engine

  // AI prompt (optional, used if you already integrated AI)
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    let newErrors = {};
    if (step === 1) {
      if (!basics.name) newErrors.name = "Name is required";
      if (basics.email && !/^\S+@\S+\.\S+$/.test(basics.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validateStep(currentStep))
      setCurrentStep((p) => Math.min(p + 1, totalSteps));
  };
  const handleBackClick = () => {
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const stepsList = [
    { id: 1, name: "Personal Info" },
    { id: 2, name: "Experience" },
    { id: 3, name: "Education" },
    { id: 4, name: "Skills" },
    { id: 5, name: "Review" },
  ];

  const [collapsedSections, setCollapsedSections] = useState({
    basics: false,
    aiAssistant: true,
    summary: false,
    work: false,
    skills: false,
    education: false,
  });

  const toggleSectionCollapse = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const shouldShowBlock = (type) => type !== "header";

  // Build blocks from template sections in order
  const applyTemplate = useCallback(
    (templateId) => {
      const tpl = templates.find(
        (t) => t.id === templateId || t._id === templateId,
      );
      if (!tpl) return;

      // Special handling for 'creative-bold' template's sidebar/main structure
      if (tpl.id === "creative-bold") {
        setBlocks((currentBlocks) => {
          const sidebarSections = ["contact", "skills", "awards"]; // `id`s from creative-bold sidebar
          const mainSections = [
            "summary",
            "experience",
            "education",
            "projects",
            "volunteer",
            "publications",
            "languages",
            "interests",
          ]; // `id`s from creative-bold main

          const sidebarBlockTypes = sidebarSections
            .map((id) =>
              Object.keys(blockTypeToResumeJsonSection).find(
                (key) => blockTypeToResumeJsonSection[key] === id,
              ),
            )
            .filter(Boolean);
          const mainBlockTypes = mainSections
            .map((id) =>
              Object.keys(blockTypeToResumeJsonSection).find(
                (key) => blockTypeToResumeJsonSection[key] === id,
              ),
            )
            .filter(Boolean);

          const allTemplateBlockTypes = [
            ...sidebarBlockTypes,
            ...mainBlockTypes,
          ];

          return allTemplateBlockTypes
            .map((blockType) => {
              return (
                currentBlocks.find((b) => b.type === blockType) ||
                (TEMPLATES[blockType] ? TEMPLATES[blockType]() : null)
              );
            })
            .filter(Boolean);
        });
        return;
      }

      setBlocks((currentBlocks) => {
        // Get all section IDs defined in the new template's structure.
        const templateSectionIds = (tpl.structure?.sections || [])
          .flatMap((s) =>
            s.type === "sidebar" || s.type === "main" ? s.sections || [] : s,
          )
          .map((s) => s.id)
          .filter(Boolean);

        // Map these IDs to our internal block types (e.g., 'experience' -> 'work').
        const templateBlockTypes = templateSectionIds
          .map((id) =>
            Object.keys(blockTypeToResumeJsonSection).find(
              (key) => blockTypeToResumeJsonSection[key] === id,
            ),
          )
          .filter(Boolean);

        // Get all block types the user currently has.
        const currentBlockTypes = currentBlocks.map((b) => b.type);

        // Create a combined list of block types, preserving the template's order and appending any extra blocks from the user.
        const combinedBlockTypes = [...templateBlockTypes];
        currentBlockTypes.forEach((type) => {
          if (!combinedBlockTypes.includes(type)) {
            combinedBlockTypes.push(type);
          }
        });

        // Build the next set of blocks from this combined list.
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

        // Ensure a summary block always exists.
        if (!nextBlocks.some((b) => b.type === "summary")) {
          const existingSummary = currentBlocks.find(
            (b) => b.type === "summary",
          );
          nextBlocks.unshift(existingSummary || TEMPLATES.summary());
        }

        return nextBlocks;
      });
    },
    [templates],
  );

  // Fetch resume data on mount if ID is present in URL
  useEffect(() => {
    const fetchResume = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) {
        // If no ID, it's a new resume, so ensure the template is applied.
        // We need to wait for templates to be loaded first.
        if (templates.length > 0 && !resumeId) {
          applyTemplate(selectedTemplateId || templates[0]?._id);
        }
        return; // Exit if no ID
      }

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `/api/resumes/${encodeURIComponent(id)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        if (data) {
          setResumeName(data.title || "Untitled Resume");
          setSelectedTemplateId(data.templateId || templates[0]?.id);
          setTheme(data.theme);

          // Ensure basics and its nested properties are always valid
          const fetchedBasics = data.basics || {};
          setBasics((prev) => ({
            ...prev,
            ...fetchedBasics,
            location: {
              ...(prev.location || {}),
              ...(fetchedBasics.location || {}),
            },
            profiles: fetchedBasics.profiles || prev.profiles || [],
          }));

          setBlocks(data.blocks || []);
          setResumeId(data.id || data._id);
        }
      } catch (error) {
        console.error("Failed to fetch resume", error);
        // Fallback for safety
        applyTemplate(selectedTemplateId);
      }
    };

    // Only fetch if templates are loaded to avoid race conditions
    if (templates.length > 0) {
      fetchResume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]); // Re-run when templates are loaded
  // Memoize data used by both preview and print, passing the selected template
  const renderData = useMemo(
    () => composeResumeJson(blocks, basics, selectedTemplate),
    [blocks, basics, selectedTemplate],
  );

  // Fetch templates from the database
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("/api/templates"); // Replace "/api/templates" with your actual API endpoint
        setTemplates(response.data);

        // Check if a template was passed in the location state
        if (location.state?.template) {
          const templateFromState = location.state.template;
          setSelectedTemplateId(templateFromState.id || templateFromState._id);
        } else {
          const firstTemplate = response.data[0];
          setSelectedTemplateId(firstTemplate?.id || firstTemplate?._id || "");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [location.state]);

  // Helpers
  const updateBlock = useCallback((index, patch) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const removeBlock = useCallback((index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
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
  }, []);

  const addBlock = useCallback(
    (type) => {
      if (
        BLOCK_CONFIG[type]?.singleton &&
        blocks.some((b) => b.type === type)
      ) {
        alert(`A "${type}" section already exists and can only be added once.`);
        return;
      }
      const tpl = TEMPLATES[type];
      if (!tpl) return;
      setBlocks((prev) => [...prev, tpl()]);
    },
    [blocks],
  );

  // Entry editing helpers
  const updateWorkEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addWorkEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
    });
    updateBlock(blockIndex, { entries });
  };

  const removeWorkEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };

  const updateEduEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addEduEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({
      institution: "",
      studyType: "",
      area: "",
      startDate: "",
      endDate: "",
      score: "",
      summary: "",
    });
    updateBlock(blockIndex, { entries });
  };

  const removeEduEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };

  const updateSkillGroup = (blockIndex, groupIndex, patch) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups[groupIndex] = { ...groups[groupIndex], ...patch };
    updateBlock(blockIndex, { groups });
  };

  const addSkillGroup = (blockIndex) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups.push({ name: "", level: "", keywords: [] });
    updateBlock(blockIndex, { groups });
  };

  const removeSkillGroup = (blockIndex, groupIndex) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups.splice(groupIndex, 1);
    updateBlock(blockIndex, { groups });
  };

  const updateProjectEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addProjectEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({ name: "", description: "", url: "", technologies: [] });
    updateBlock(blockIndex, { entries });
  };

  const removeProjectEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };

  const handleFieldChange = useCallback(
    (path, value) => {
      const keys = path.split(".");
      const [section, index, field] = keys;

      if (section === "header") {
        const fieldMap = {
          name: "name",
          title: "label",
          "contact.email": "email",
          "contact.phone": "phone",
        };
        const basicsField = fieldMap[keys.slice(1).join(".")];
        if (basicsField) {
          setBasics((prev) => ({ ...prev, [basicsField]: value }));
        }
      } else if (section === "summary") {
        const blockIndex = blocks.findIndex((b) => b.type === "summary");
        if (blockIndex !== -1) {
          updateBlock(blockIndex, { content: value });
        }
      } else if (index !== undefined && field) {
        // This handles array-based sections like experience, education, etc.
        const resumeJsonSection =
          blockTypeToResumeJsonSection[section] || section;
        const blockIndex = blocks.findIndex(
          (b) => b.type === resumeJsonSection,
        );
        if (blockIndex !== -1) {
          const entryIndex = parseInt(index, 10);
          const block = blocks[blockIndex];
          const entries = [...(block.entries || block.groups || [])];
          if (entries[entryIndex]) {
            entries[entryIndex] = { ...entries[entryIndex], [field]: value };
            updateBlock(blockIndex, {
              [block.entries ? "entries" : "groups"]: entries,
            });
          }
        }
      }
    },
    [blocks, updateBlock],
  );

  // React preview element using ResumeRenderer
  const reactPreview = useMemo(() => {
    if (!selectedTemplate) {
      return (
        <div className="p-6 text-center text-gray-500">Loading template...</div>
      );
    }

    if (selectedTemplate.id === "ats-classic" || selectedTemplate.isAts) {
      return <AtsClassicRenderer resumeData={renderData} />;
    }

    // 1. Start with a deep copy of the selected template.
    const dynamicTemplate = JSON.parse(JSON.stringify(selectedTemplate));

    // 2. Helper to find all section IDs within a structure.
    const getAllSectionIds = (sections = []) => {
      return sections.flatMap((s) =>
        s.type === "sidebar" || s.type === "main"
          ? getAllSectionIds(s.sections)
          : s.id,
      );
    };

    // 3. Get a Set of all section IDs that are explicitly defined in the template's structure.
    const templateSectionIds = new Set(
      getAllSectionIds(dynamicTemplate.structure.sections),
    );

    // 4. Identify any user blocks that are NOT represented in the template's native structure.
    const unrenderedBlocks = blocks.filter((block) => {
      const sectionId = blockTypeToResumeJsonSection[block.type];
      return !templateSectionIds.has(sectionId);
    });

    // 5. If there are unrendered blocks, append them to the main content area.
    if (unrenderedBlocks.length > 0) {
      // Find the main content area, or fall back to the root structure itself.
      const mainContent =
        dynamicTemplate.structure.sections?.find((s) => s.type === "main") ||
        dynamicTemplate.structure;
      if (!mainContent.sections) {
        mainContent.sections = [];
      }

      unrenderedBlocks.forEach((block) => {
        const sectionId = blockTypeToResumeJsonSection[block.type];
        if (sectionId) {
          // Use the default, clean layout for this extra section.
          const defaultSection = DEFAULT_SECTION_TEMPLATES[sectionId];
          if (defaultSection) {
            mainContent.sections.push(defaultSection);
          }
        }
      });
    }

    // 6. Render the final composed template. The renderer will handle showing/hiding sections based on data.
    return (
      <ResumeRenderer template={dynamicTemplate} resumeData={renderData} />
    );
  }, [selectedTemplate, renderData, blocks]);

  // Save to backend
  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: resumeName,
        templateId: selectedTemplateId,
        theme,
        style: selectedTemplate?.style || {},
        blocks,
        basics,
        resumeData: renderData,
      };

      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      let resp;
      if (resumeId) {
        resp = await axios.put(
          `/api/resumes/${encodeURIComponent(resumeId)}`,
          payload,
          config,
        );
      } else {
        resp = await axios.post("/api/resumes", payload, config);
      }

      const saved = resp?.data || {};
      if (saved?.id || saved?._id) {
        setResumeId(saved.id || saved._id);
      }
      setLastSavedAt(new Date());
    } catch (e) {
      // Optional fallback to localStorage if offline
      try {
        const drafts = JSON.parse(
          localStorage.getItem("resume_drafts") || "[]",
        );
        const draft = {
          id: resumeId || `draft_${Date.now()}`,
          ...{
            title: resumeName,
            templateId: selectedTemplateId,
            theme,
            style: selectedTemplate?.style || {},
            blocks,
            basics,
            resumeData: renderData,
            updatedAt: new Date().toISOString(),
          },
        };
        const idx = drafts.findIndex((d) => d.id === draft.id);
        if (idx >= 0) drafts[idx] = draft;
        else drafts.push(draft);
        localStorage.setItem("resume_drafts", JSON.stringify(drafts));
        setResumeId(draft.id);
        setLastSavedAt(new Date());
        console.warn(
          "Saved locally (offline). Backend save failed:",
          e?.response?.data || e?.message,
        );
      } catch {
        alert(
          e?.response?.data?.message || e?.message || "Failed to save resume",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // AI: Generate full resume content
  const onGenerateFull = async () => {
    setAiLoading(true);
    try {
      const current = renderData;
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const { data } = await axios.post(
        "/api/ai",
        { scope: "full", prompt: aiPrompt, resumeData: current },
        config,
      );

      const generated = data?.resumeData || data || {};

      // Merge basics
      const aiBasics = generated.basics || generated.personalInfo;
      if (aiBasics) {
        setBasics((prev) => ({
          ...prev,
          ...aiBasics,
          label: aiBasics.label || aiBasics.title, // Map title to label
        }));
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
                  highlights: Array.isArray(w.highlights) ? w.highlights : [],
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
                  studyType: e.studyType || "",
                  area: e.area || "",
                  startDate: e.startDate || "",
                  endDate: e.endDate || "",
                  score: e.score || "",
                  summary: e.summary || "",
                })),
              }
            : null,
        skills:
          Array.isArray(generated?.skills) && generated.skills.length
            ? {
                type: "skills",
                title: "Skills",
                groups: generated.skills.map((s) => ({
                  name: s.name || "",
                  level: s.level || "",
                  keywords: Array.isArray(s.keywords) ? s.keywords : [],
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
                    ? p.technologies.filter(Boolean)
                    : [],
                })),
              }
            : null,
        awards:
          Array.isArray(generated?.awards) && generated.awards.length
            ? {
                type: "awards",
                title: "Awards",
                entries: generated.awards,
              }
            : null,
        volunteer:
          Array.isArray(generated?.volunteer) && generated.volunteer.length
            ? {
                type: "volunteer",
                title: "Volunteer",
                entries: generated.volunteer,
              }
            : null,
        publications:
          Array.isArray(generated?.publications) &&
          generated.publications.length
            ? {
                type: "publications",
                title: "Publications",
                entries: generated.publications,
              }
            : null,
        languages:
          Array.isArray(generated?.languages) && generated.languages.length
            ? {
                type: "languages",
                title: "Languages",
                entries: generated.languages,
              }
            : null,
      };

      // Rebuild blocks from generated resume aligned with template order
      const templateOrder = (selectedTemplate?.sections || [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => SECTION_TYPE_TO_BLOCK[s.type]);

      const generatedKeys = Object.keys(generatedByType).filter(
        (k) => generatedByType[k] && k !== "header",
      );
      const order = [...new Set([...templateOrder, ...generatedKeys])];

      const next = order
        .map((t) => {
          if (t === "header") return TEMPLATES.header();
          if (generatedByType[t]) return generatedByType[t];
          return TEMPLATES[t]?.();
        })
        .filter(Boolean);

      if (!next.some((b) => b.type === "summary")) {
        const idxHeader = next.findIndex((b) => b.type === "header");
        next.splice(idxHeader >= 0 ? idxHeader + 1 : 0, 0, TEMPLATES.summary());
      }

      setBlocks(next);
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate with AI",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Generate/Improve only summary
  const onGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const { data } = await axios.post(
        "/api/ai",
        { scope: "summary", prompt: aiPrompt, resumeData: { basics } },
        config,
      );
      const summary = data?.summary || data?.basics?.summary || "";

      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "summary");
        if (idx === -1) {
          return [
            { type: "summary", title: "Summary", content: summary },
            ...prev,
          ];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], content: summary };
        return next;
      });
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate summary",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Experience bullets for a specific role
  const onDownloadPdf = async () => {
    setRendering(true);
    try {
      if (!selectedTemplate) {
        alert("Please select a template before exporting.");
        setRendering(false);
        return;
      }

      // Re-use the same logic as the live preview to build the dynamic template
      // This ensures consistency between what is seen and what is exported.
      const dynamicTemplate = JSON.parse(JSON.stringify(selectedTemplate));

      const getAllSectionIds = (sections = []) => {
        return sections.flatMap((s) =>
          s.type === "sidebar" || s.type === "main"
            ? getAllSectionIds(s.sections)
            : s.id,
        );
      };

      const templateSectionIds = new Set(
        getAllSectionIds(dynamicTemplate.structure.sections),
      );

      const unrenderedBlocks = blocks.filter((block) => {
        const sectionId = blockTypeToResumeJsonSection[block.type];
        return !templateSectionIds.has(sectionId);
      });

      if (unrenderedBlocks.length > 0) {
        const mainContent =
          dynamicTemplate.structure.sections?.find((s) => s.type === "main") ||
          dynamicTemplate.structure;
        if (!mainContent.sections) {
          mainContent.sections = [];
        }

        unrenderedBlocks.forEach((block) => {
          const sectionId = blockTypeToResumeJsonSection[block.type];
          if (sectionId) {
            const defaultSection = DEFAULT_SECTION_TEMPLATES[sectionId];
            if (defaultSection) {
              mainContent.sections.push(defaultSection);
            }
          }
        });
      }

      // The Puppeteer engine on the backend needs the rendered HTML.
      const html = ReactDOMServer.renderToStaticMarkup(
        selectedTemplate.id === "ats-classic" || selectedTemplate.isAts ? (
          <AtsClassicRenderer resumeData={renderData} />
        ) : (
          <ResumeRenderer template={dynamicTemplate} resumeData={renderData} />
        ),
      );
      const payload = {
        engine: "puppeteer",
        html,
        templateId: selectedTemplateId,
      };

      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.post("/api/resumes/export-pdf", payload, {
        ...config,
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
      alert(
        e?.response?.data?.message || e?.message || "Failed to generate PDF",
      );
    } finally {
      setRendering(false);
    }
  };
  const onGenerateWorkBullets = async (blockIndex, entryIndex) => {
    setAiLoading(true);
    try {
      const entry = blocks[blockIndex]?.entries?.[entryIndex];
      if (!entry) return;

      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const { data } = await axios.post(
        "/api/ai",
        {
          scope: "experience-item",
          prompt: aiPrompt,
          item: {
            company: entry.company,
            position: entry.position,
            summary: entry.summary,
            startDate: entry.startDate,
            endDate: entry.endDate,
          },
        },
        config,
      );

      const text = String(data?.summary || "").trim();
      const bullets = text
        .split(/\r?\n|•|- |\u2022/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (bullets.length >= 2) {
        updateWorkEntry(blockIndex, entryIndex, { highlights: bullets });
      } else {
        updateWorkEntry(blockIndex, entryIndex, { summary: text });
      }
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate experience bullets",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const [showTailorModal, setShowTailorModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorSuggestions, setTailorSuggestions] = useState(null);
  const [showAtsDrawer, setShowAtsDrawer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboardingComplete = (data) => {
    setShowOnboarding(false);
    if (data?.roleTitle) {
      setResumeName(`${data.roleTitle} Resume`);
      setBasics((b) => ({ ...b, label: data.roleTitle }));
    }
    if (data?.jobDescription) {
      setJobDescription(data.jobDescription);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription) return alert("Please enter a job description");

    setTailorLoading(true);
    setTailorSuggestions(null);
    try {
      let currentResumeId = resumeId;
      if (!currentResumeId) {
        await onSave();
      }

      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      if (!resumeId) {
        alert("Please save your resume first before tailoring.");
        setTailorLoading(false);
        return;
      }

      const { data } = await api.post(
        "/tailor",
        {
          resumeId,
          jobDescription,
        },
        config,
      );

      if (data?.suggestions) {
        setTailorSuggestions(data.suggestions);
      }
    } catch (e) {
      alert(
        "Failed to tailor resume: " + (e.response?.data?.message || e.message),
      );
    } finally {
      setTailorLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-black/[0.08] bg-white text-[#1a1a1a] placeholder:text-zinc-400 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black/10 transition shadow-2xs";
  const inputSm =
    "w-full rounded-lg border border-black/[0.08] bg-white text-[#1a1a1a] placeholder:text-zinc-400 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black/10 transition shadow-2xs";

  const savedLabel = lastSavedAt
    ? `Saved ${timeAgo(lastSavedAt)}`
    : "Not saved";

  return (
    <div className="relative flex flex-col min-h-screen bg-bg-base text-zinc-900 selection:bg-brand-green selection:text-black font-sans">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-black/[0.02] to-transparent blur-2xl" />

      {/* Sticky Top Toolbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/[0.06] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Brand + Editable Title + Autosave badge + ATS Score */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#9fff00] text-[#1a1a1a] flex items-center justify-center font-bold text-white shadow text-sm">
              RA
            </span>
            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition group">
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Senior Full Stack Engineer Resume"
                className="bg-transparent text-sm font-bold text-[#1a1a1a] outline-none w-44 sm:w-60 truncate font-['Outfit']"
              />
              <span className="text-gray-400 group-hover:text-[#1a1a1a] text-xs">
                ✏️
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#EDEEF5] border border-black/[0.06] px-2.5 py-1 rounded-full text-[#1a1a1a]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{savedLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAtsDrawer((d) => !d)}
            className="cursor-pointer transition hover:scale-105 active:scale-95"
            title="Toggle ATS Telemetry Copilot"
          >
            <AtsScoreBadge score={98} isOptimized={true} />
          </button>
        </div>

        {/* Center: Template & Typography Controls */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Template switcher */}
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-full px-3 py-1 text-xs text-[#1a1a1a] shadow-2xs">
            <span className="text-[#1a1a1a]">📄</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTemplateId(id);
                applyTemplate(id);
              }}
              className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
            >
              {allTemplates.map((t) => (
                <option
                  key={t.id || t._id}
                  value={t.id || t._id}
                  className="bg-gray-900 text-white"
                >
                  {t.name} {t.isAts ? "(ATS Approved)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Font Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-full px-3 py-1 text-xs text-[#1a1a1a] shadow-2xs">
            <span className="font-serif">Aa</span>
            <select
              value={activeFont}
              onChange={(e) => setActiveFont(e.target.value)}
              className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
            >
              <option value="Inter" className="bg-gray-900 text-white">
                Inter
              </option>
              <option value="Roboto" className="bg-gray-900 text-white">
                Roboto
              </option>
              <option value="Merriweather" className="bg-gray-900 text-white">
                Merriweather
              </option>
              <option value="Calibri" className="bg-gray-900 text-white">
                Calibri
              </option>
            </select>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-full px-2.5 py-1">
            {["#4f46e5", "#7c3aed", "#059669", "#1e293b"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveThemeColor(c)}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-full border border-white/30 transition-transform ${activeThemeColor === c ? "scale-125 ring-2 ring-[#9fff00]" : "hover:scale-110"}`}
                title={`Theme Color: ${c}`}
              />
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white border border-black/[0.08] rounded-full px-2 py-0.5 text-xs text-gray-300">
            <button
              type="button"
              onClick={() =>
                setZoomLevel((z) => Math.max(0.7, +(z - 0.05).toFixed(2)))
              }
              className="px-1.5 py-0.5 hover:text-white"
            >
              −
            </button>
            <span className="w-10 text-center font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoomLevel((z) => Math.min(1.3, +(z + 0.05).toFixed(2)))
              }
              className="px-1.5 py-0.5 hover:text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${mobileTab === "edit" ? "bg-[#1a1a1a] dark:bg-[#9fff00] text-white shadow" : "text-gray-300 hover:text-white"}`}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${mobileTab === "preview" ? "bg-[#1a1a1a] dark:bg-[#9fff00] text-white shadow" : "text-gray-300 hover:text-white"}`}
            >
              👁️ Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-300 transition"
            title="Open Career Baseline Calibration"
          >
            <span>🎯</span> Baseline Calibration
          </button>

          <button
            type="button"
            onClick={() => setShowTailorModal(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#9fff00]/40 bg-[#9fff00]/10 hover:bg-[#9fff00]/20 px-3 py-1.5 text-xs font-medium text-[#9fff00] transition"
          >
            <span>✨</span> Tailor to Job
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium text-[#1a1a1a] border border-black/[0.1] hover:bg-black/[0.04] transition ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={rendering}
            className="rounded-full bg-[#1a1a1a] hover:bg-black px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5 hover:scale-[1.02]"
          >
            <span>⬇️</span> {rendering ? "Exporting..." : "Download PDF"}
          </button>
        </div>
      </header>

      {/* Enhancv Two-Pane Workspace */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Far Left Navigation Rail (Desktop) */}
        <aside className="hidden lg:flex w-16 flex-col items-center py-4 border-r border-black/[0.06] bg-white/70 backdrop-blur flex-shrink-0 z-20">
          <div className="flex flex-col gap-3 w-full px-2">
            <button
              type="button"
              onClick={() => {
                setActiveRailTab("templates");
                setRailDrawerOpen((o) =>
                  activeRailTab === "templates" ? !o : true,
                );
              }}
              className={`w-full flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium transition ${activeRailTab === "templates" && railDrawerOpen ? "bg-[#1a1a1a] text-white shadow-xs" : "text-[#8e8e8e] hover:text-[#1a1a1a] hover:bg-black/[0.04]"}`}
              title="Templates"
            >
              <span className="text-base">📑</span>
              <span className="text-[10px]">Templates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRailTab("colors");
                setRailDrawerOpen((o) =>
                  activeRailTab === "colors" ? !o : true,
                );
              }}
              className={`w-full flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium transition ${activeRailTab === "colors" && railDrawerOpen ? "bg-[#1a1a1a] text-white shadow-xs" : "text-[#8e8e8e] hover:text-[#1a1a1a] hover:bg-black/[0.04]"}`}
              title="Colors"
            >
              <span className="text-base">🎨</span>
              <span className="text-[10px]">Colors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRailTab("typography");
                setRailDrawerOpen((o) =>
                  activeRailTab === "typography" ? !o : true,
                );
              }}
              className={`w-full flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium transition ${activeRailTab === "typography" && railDrawerOpen ? "bg-[#1a1a1a] text-white shadow-xs" : "text-[#8e8e8e] hover:text-[#1a1a1a] hover:bg-black/[0.04]"}`}
              title="Typography"
            >
              <span className="text-base">🔤</span>
              <span className="text-[10px]">Fonts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRailTab("sections");
                setRailDrawerOpen((o) =>
                  activeRailTab === "sections" ? !o : true,
                );
              }}
              className={`w-full flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium transition ${activeRailTab === "sections" && railDrawerOpen ? "bg-[#1a1a1a] text-white shadow-xs" : "text-[#8e8e8e] hover:text-[#1a1a1a] hover:bg-black/[0.04]"}`}
              title="Sections"
            >
              <span className="text-base">➕</span>
              <span className="text-[10px]">Sections</span>
            </button>
          </div>
        </aside>

        {/* Rail Flyout Drawer */}
        {railDrawerOpen && (
          <div className="hidden lg:block w-72 border-r border-black/[0.06] bg-white p-4 overflow-y-auto z-20 shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/[0.06]">
              <h3 className="text-sm font-semibold text-white capitalize">
                {activeRailTab}
              </h3>
              <button
                type="button"
                onClick={() => setRailDrawerOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {activeRailTab === "templates" && (
              <div className="space-y-3">
                {allTemplates.map((t) => {
                  const isSelected = selectedTemplateId === (t.id || t._id);
                  return (
                    <div
                      key={t.id || t._id}
                      onClick={() => {
                        setSelectedTemplateId(t.id || t._id);
                        applyTemplate(t.id || t._id);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition ${isSelected ? "border-[#9fff00] bg-[#9fff00]/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-white">
                          {t.name}
                        </span>
                        {t.isAts && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            ATS Approved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-tight">
                        {t.description ||
                          "Clean, high-parsing resume template."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {activeRailTab === "colors" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Choose primary theme accent color:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Indigo", hex: "#4f46e5" },
                    { label: "Purple", hex: "#7c3aed" },
                    { label: "Emerald", hex: "#059669" },
                    { label: "Slate", hex: "#1e293b" },
                    { label: "Blue", hex: "#2563eb" },
                    { label: "Rose", hex: "#e11d48" },
                    { label: "Teal", hex: "#0d9488" },
                    { label: "Dark", hex: "#111827" },
                  ].map((item) => (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => setActiveThemeColor(item.hex)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/10 hover:border-white/20"
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/30"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="text-[10px] text-gray-300">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeRailTab === "typography" && (
              <div className="space-y-2">
                <p className="text-xs text-[#8e8e8e] mb-2 font-mono text-xs">
                  Select document typography:
                </p>
                {["Inter", "Roboto", "Merriweather", "Calibri", "Georgia"].map(
                  (font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setActiveFont(font)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition ${activeFont === font ? "border-[#9fff00] bg-[#9fff00]/10 text-white" : "border-white/10 text-gray-300 hover:bg-white/5"}`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ),
                )}
              </div>
            )}

            {activeRailTab === "sections" && (
              <div className="space-y-2">
                <p className="text-xs text-[#8e8e8e] mb-2 font-mono text-xs">
                  Add new section block:
                </p>
                {Object.keys(TEMPLATES)
                  .filter((type) => type !== "header")
                  .map((type) => {
                    const tpl = TEMPLATES[type];
                    if (!tpl) return null;
                    const title = tpl().title;
                    const exists = blocks.some((b) => b.type === type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          addBlock(type);
                          setRailDrawerOpen(false);
                        }}
                        disabled={BLOCK_CONFIG[type]?.singleton && exists}
                        className="w-full text-left p-2.5 rounded-lg text-xs font-medium border border-white/10 text-gray-200 hover:bg-white/5 hover:border-[#9fff00]/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex justify-between items-center"
                      >
                        <span>{title}</span>
                        <span className="text-[#1a1a1a] font-bold">+</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Left Pane: Scrollable Form Editor */}
        <div
          className={`${mobileTab === "preview" ? "hidden lg:block" : "block"} w-full lg:w-[46%] xl:w-[44%] h-[calc(100vh-64px)] overflow-y-auto border-r border-black/[0.06] p-4 sm:p-6 space-y-4 bg-[#EDEEF5]`}
        >
          {/* Quick Section Jump Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>📝</span> Content Editor
            </h2>
            <div className="text-xs text-gray-400">
              {blocks.length + 1} sections
            </div>
          </div>

          {/* 1. Personal Information Card */}
          <SectionCard
            title="Personal Information"
            action={
              <button
                type="button"
                onClick={() => toggleSectionCollapse("basics")}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                {collapsedSections.basics ? "▼ Expand" : "▲ Collapse"}
              </button>
            }
          >
            {!collapsedSections.basics && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name">
                    <input
                      className={`${input} ${errors.name ? "border-red-500" : ""}`}
                      value={basics.name}
                      onChange={(e) =>
                        setBasics({ ...basics, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <span className="text-red-400 text-xs mt-1 block">
                        {errors.name}
                      </span>
                    )}
                  </Field>
                  <Field label="Job Title / Headline">
                    <input
                      className={input}
                      value={basics.label}
                      onChange={(e) =>
                        setBasics({ ...basics, label: e.target.value })
                      }
                      placeholder="Senior Full Stack Engineer"
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      className={`${input} ${errors.email ? "border-red-500" : ""}`}
                      value={basics.email}
                      onChange={(e) =>
                        setBasics({ ...basics, email: e.target.value })
                      }
                      placeholder="jane.doe@example.com"
                    />
                    {errors.email && (
                      <span className="text-red-400 text-xs mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </Field>
                  <Field label="Phone Number">
                    <input
                      className={input}
                      value={basics.phone}
                      onChange={(e) =>
                        setBasics({ ...basics, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </Field>
                  <Field label="Location (City, State/Country)">
                    <input
                      className={input}
                      value={basics.location?.city || ""}
                      onChange={(e) =>
                        setBasics({
                          ...basics,
                          location: {
                            ...(basics.location || {}),
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="San Francisco, CA"
                    />
                  </Field>
                  <Field label="Portfolio / Website URL">
                    <input
                      className={input}
                      value={basics.url}
                      onChange={(e) =>
                        setBasics({ ...basics, url: e.target.value })
                      }
                      placeholder="https://janedoe.dev"
                    />
                  </Field>
                  <Field label="Photo URL">
                    <input
                      className={input}
                      value={basics.photo || ""}
                      onChange={(e) =>
                        setBasics({ ...basics, photo: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Quick AI Generator Card (Collapsible) */}
          <SectionCard
            title="✨ AI Resume Assistant"
            action={
              <button
                type="button"
                onClick={() => toggleSectionCollapse("aiAssistant")}
                className="text-xs text-[#9fff00] hover:text-[#9fff00]"
              >
                {collapsedSections.aiAssistant ? "▼ Expand" : "▲ Collapse"}
              </button>
            }
            footer="Paste target job role or job description to generate targeted content."
          >
            {!collapsedSections.aiAssistant && (
              <div className="space-y-3 pt-1">
                <textarea
                  rows={2}
                  className={input}
                  placeholder="e.g. Senior Frontend Engineer with 5+ years in React, TypeScript, Cloud..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-[#1a1a1a] dark:bg-[#9fff00] hover:bg-[#1a1a1a] dark:bg-[#9fff00] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 transition flex items-center gap-1.5"
                    onClick={onGenerateFull}
                    disabled={aiLoading}
                  >
                    <span>✨</span>{" "}
                    {aiLoading ? "Generating..." : "Auto-Fill Entire Resume"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#9fff00]/30 bg-[#9fff00]/10 hover:bg-[#9fff00]/20 px-3 py-1.5 text-xs font-medium text-[#9fff00] disabled:opacity-60 transition flex items-center gap-1.5"
                    onClick={onGenerateSummary}
                    disabled={aiLoading}
                  >
                    <span>✨</span> Generate Summary Only
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Main block editor */}
          <main className="space-y-4">
            {blocks.map((b, i) => {
              if (!shouldShowBlock(b.type)) return null;
              if (b.type === "header") {
                return null; // Header is not an editable block in this UI, basics are handled separately
              }

              if (b.type === "summary") {
                return (
                  <SectionCard
                    key={i}
                    title="Professional Summary"
                    action={
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAiPopoverOpen((o) => !o)}
                          className="flex items-center gap-1.5 text-xs text-[#9fff00] hover:text-[#9fff00] bg-[#9fff00]/10 border border-[#9fff00]/30 px-2.5 py-1 rounded-lg transition"
                        >
                          <span>✨</span> ATS Keyword Optimizer
                        </button>
                      </div>
                    }
                  >
                    <div className="relative">
                      <textarea
                        rows={4}
                        className={input}
                        placeholder="Impact-focused 2–3 sentence professional summary with keywords..."
                        value={b.content || ""}
                        onChange={(e) =>
                          updateBlock(i, { content: e.target.value })
                        }
                      />
                      <AiSuggestionPopover
                        isOpen={aiPopoverOpen}
                        onClose={() => setAiPopoverOpen(false)}
                        title="ATS Keyword Optimizer"
                        suggestion={aiSuggestedSummary}
                        onApply={() => {
                          updateBlock(i, { content: aiSuggestedSummary });
                          setAiPopoverOpen(false);
                        }}
                        onDiscard={() => setAiPopoverOpen(false)}
                      />
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "work") {
                return (
                  <SectionCard
                    key={i}
                    title="Experience"
                    action={
                      <button
                        className="underline"
                        onClick={() => addWorkEntry(i)}
                      >
                        + Add Role
                      </button>
                    }
                    footer="Outcome-focused bullets work best."
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Company">
                              <input
                                className={inputSm}
                                value={e.company || ""}
                                onChange={(ev) =>
                                  updateWorkEntry(i, ei, {
                                    company: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Position">
                              <input
                                className={inputSm}
                                value={e.position || ""}
                                onChange={(ev) =>
                                  updateWorkEntry(i, ei, {
                                    position: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Start">
                              <input
                                className={inputSm}
                                placeholder="YYYY-MM"
                                value={e.startDate || ""}
                                onChange={(ev) =>
                                  updateWorkEntry(i, ei, {
                                    startDate: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="End">
                              <input
                                className={inputSm}
                                placeholder="YYYY-MM or Present"
                                value={e.endDate || ""}
                                onChange={(ev) =>
                                  updateWorkEntry(i, ei, {
                                    endDate: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <div className="sm:col-span-2">
                              <SmallField label="Summary">
                                <textarea
                                  className={inputSm}
                                  rows={2}
                                  value={e.summary || ""}
                                  onChange={(ev) =>
                                    updateWorkEntry(i, ei, {
                                      summary: ev.target.value,
                                    })
                                  }
                                />
                              </SmallField>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                Highlights
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-xs underline text-gray-300 hover:text-white"
                                  onClick={() => {
                                    const highlights = Array.isArray(
                                      e.highlights,
                                    )
                                      ? [...e.highlights]
                                      : [];
                                    highlights.push("");
                                    updateWorkEntry(i, ei, { highlights });
                                  }}
                                >
                                  + Add Highlight
                                </button>
                                <button
                                  type="button"
                                  className="text-xs underline text-[#9fff00] hover:text-[#9fff00]"
                                  onClick={() => onGenerateWorkBullets(i, ei)}
                                  title="AI: generate bullet points"
                                  disabled={aiLoading}
                                >
                                  ✨ Auto bullets
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 space-y-2">
                              {(Array.isArray(e.highlights)
                                ? e.highlights
                                : []
                              ).map((h, hi) => (
                                <div
                                  key={hi}
                                  className="flex items-center gap-2 group/bullet"
                                >
                                  <span
                                    className="text-gray-500 cursor-grab text-xs select-none"
                                    title="Drag to reorder"
                                  >
                                    ⋮⋮
                                  </span>
                                  <input
                                    className={inputSm}
                                    value={h || ""}
                                    onChange={(ev) => {
                                      const highlights = Array.isArray(
                                        e.highlights,
                                      )
                                        ? [...e.highlights]
                                        : [];
                                      highlights[hi] = ev.target.value;
                                      updateWorkEntry(i, ei, { highlights });
                                    }}
                                    placeholder="Shipped feature X, increasing performance by 40%..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onGenerateWorkBullets(i, ei)}
                                    className="p-1.5 rounded bg-[#9fff00]/10 hover:bg-[#9fff00]/20 text-[#9fff00] border border-[#9fff00]/30 text-xs flex-shrink-0 transition"
                                    title="AI Rewrite"
                                  >
                                    ✨
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-1"
                                    onClick={() => {
                                      const highlights = Array.isArray(
                                        e.highlights,
                                      )
                                        ? [...e.highlights]
                                        : [];
                                      highlights.splice(hi, 1);
                                      updateWorkEntry(i, ei, { highlights });
                                    }}
                                    title="Remove highlight"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() => removeWorkEntry(i, ei)}
                            >
                              Delete role
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "education") {
                return (
                  <SectionCard
                    key={i}
                    title="Education"
                    action={
                      <button
                        className="underline"
                        onClick={() => addEduEntry(i)}
                      >
                        + Add Education
                      </button>
                    }
                    footer="Latest first. Include degree, field, dates."
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Institution">
                              <input
                                className={inputSm}
                                value={e.institution || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    institution: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Degree">
                              <input
                                className={inputSm}
                                value={e.studyType || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    studyType: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Field">
                              <input
                                className={inputSm}
                                value={e.area || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    area: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Score/GPA">
                              <input
                                className={inputSm}
                                value={e.score || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    score: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Start">
                              <input
                                className={inputSm}
                                placeholder="YYYY"
                                value={e.startDate || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    startDate: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="End">
                              <input
                                className={inputSm}
                                placeholder="YYYY"
                                value={e.endDate || ""}
                                onChange={(ev) =>
                                  updateEduEntry(i, ei, {
                                    endDate: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <SmallField label="Summary/Courses">
                            <textarea
                              className={inputSm}
                              rows={2}
                              value={e.summary || ""}
                              onChange={(ev) =>
                                updateEduEntry(i, ei, {
                                  summary: ev.target.value,
                                })
                              }
                            />
                          </SmallField>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() => removeEduEntry(i, ei)}
                            >
                              Delete education
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "skills") {
                return (
                  <SectionCard
                    key={i}
                    title="Skills"
                    action={
                      <button
                        className="underline"
                        onClick={() => addSkillGroup(i)}
                      >
                        + Add Group
                      </button>
                    }
                    footer="Group skills by category. Keep keywords scannable."
                  >
                    <div className="space-y-4">
                      {(b.groups || []).map((g, gi) => (
                        <div
                          key={gi}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <SmallField label="Category">
                              <input
                                className={inputSm}
                                value={g.name || ""}
                                onChange={(ev) =>
                                  updateSkillGroup(i, gi, {
                                    name: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Level">
                              <input
                                className={inputSm}
                                value={g.level || ""}
                                onChange={(ev) =>
                                  updateSkillGroup(i, gi, {
                                    level: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Keywords (comma-separated)">
                              <input
                                className={inputSm}
                                value={(g.keywords || []).join(", ")}
                                onChange={(ev) =>
                                  updateSkillGroup(i, gi, {
                                    keywords: ev.target.value
                                      .split(",")
                                      .map((k) => k.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() => removeSkillGroup(i, gi)}
                            >
                              Delete group
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }
              if (b.type === "projects") {
                return (
                  <SectionCard
                    key={i}
                    title="Projects"
                    action={
                      <button
                        className="underline"
                        onClick={() => addProjectEntry(i)}
                      >
                        + Add Project
                      </button>
                    }
                    footer="Showcase your work. Include links if possible."
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Project Name">
                              <input
                                className={inputSm}
                                value={e.name || ""}
                                onChange={(ev) =>
                                  updateProjectEntry(i, ei, {
                                    name: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="URL">
                              <input
                                className={inputSm}
                                value={e.url || ""}
                                onChange={(ev) =>
                                  updateProjectEntry(i, ei, {
                                    url: ev.target.value,
                                  })
                                }
                              />
                            </SmallField>
                            <div className="sm:col-span-2">
                              <SmallField label="Description">
                                <textarea
                                  className={inputSm}
                                  rows={2}
                                  value={e.description || ""}
                                  onChange={(ev) =>
                                    updateProjectEntry(i, ei, {
                                      description: ev.target.value,
                                    })
                                  }
                                />
                              </SmallField>
                            </div>
                            <div className="sm:col-span-2">
                              <SmallField label="Technologies (comma-separated)">
                                <input
                                  className={inputSm}
                                  value={(e.technologies || []).join(", ")}
                                  onChange={(ev) =>
                                    updateProjectEntry(i, ei, {
                                      technologies: ev.target.value
                                        .split(",")
                                        .map((k) => k.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                />
                              </SmallField>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() => removeProjectEntry(i, ei)}
                            >
                              Delete project
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }
              if (b.type === "awards") {
                return (
                  <SectionCard
                    key={i}
                    title="Awards"
                    action={
                      <button
                        className="underline"
                        onClick={() =>
                          updateBlock(i, {
                            entries: [...(b.entries || []), {}],
                          })
                        }
                      >
                        + Add Award
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Title">
                              <input
                                className={inputSm}
                                value={e.title || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, title: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Awarder">
                              <input
                                className={inputSm}
                                value={e.awarder || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, awarder: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Date">
                              <input
                                className={inputSm}
                                value={e.date || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, date: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <SmallField label="Summary">
                            <textarea
                              className={inputSm}
                              value={e.summary || ""}
                              onChange={(ev) =>
                                updateBlock(i, {
                                  entries: b.entries.map((x, xi) =>
                                    xi === ei
                                      ? { ...x, summary: ev.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </SmallField>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() =>
                                updateBlock(i, {
                                  entries: b.entries.filter(
                                    (_, xi) => xi !== ei,
                                  ),
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "volunteer") {
                return (
                  <SectionCard
                    key={i}
                    title="Volunteer"
                    action={
                      <button
                        className="underline"
                        onClick={() =>
                          updateBlock(i, {
                            entries: [...(b.entries || []), {}],
                          })
                        }
                      >
                        + Add
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Organization">
                              <input
                                className={inputSm}
                                value={e.organization || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? {
                                            ...x,
                                            organization: ev.target.value,
                                          }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Position">
                              <input
                                className={inputSm}
                                value={e.position || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, position: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Start Date">
                              <input
                                className={inputSm}
                                value={e.startDate || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, startDate: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="End Date">
                              <input
                                className={inputSm}
                                value={e.endDate || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, endDate: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <SmallField label="Summary">
                            <textarea
                              className={inputSm}
                              value={e.summary || ""}
                              onChange={(ev) =>
                                updateBlock(i, {
                                  entries: b.entries.map((x, xi) =>
                                    xi === ei
                                      ? { ...x, summary: ev.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </SmallField>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() =>
                                updateBlock(i, {
                                  entries: b.entries.filter(
                                    (_, xi) => xi !== ei,
                                  ),
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "publications") {
                return (
                  <SectionCard
                    key={i}
                    title="Publications"
                    action={
                      <button
                        className="underline"
                        onClick={() =>
                          updateBlock(i, {
                            entries: [...(b.entries || []), {}],
                          })
                        }
                      >
                        + Add
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Name">
                              <input
                                className={inputSm}
                                value={e.name || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, name: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Publisher">
                              <input
                                className={inputSm}
                                value={e.publisher || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, publisher: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Release Date">
                              <input
                                className={inputSm}
                                value={e.releaseDate || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, releaseDate: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="URL">
                              <input
                                className={inputSm}
                                value={e.url || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, url: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <SmallField label="Summary">
                            <textarea
                              className={inputSm}
                              value={e.summary || ""}
                              onChange={(ev) =>
                                updateBlock(i, {
                                  entries: b.entries.map((x, xi) =>
                                    xi === ei
                                      ? { ...x, summary: ev.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </SmallField>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() =>
                                updateBlock(i, {
                                  entries: b.entries.filter(
                                    (_, xi) => xi !== ei,
                                  ),
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              if (b.type === "languages") {
                return (
                  <SectionCard
                    key={i}
                    title="Languages"
                    action={
                      <button
                        className="underline"
                        onClick={() =>
                          updateBlock(i, {
                            entries: [...(b.entries || []), {}],
                          })
                        }
                      >
                        + Add
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {(b.entries || []).map((e, ei) => (
                        <div
                          key={ei}
                          className="rounded-2xl border border-black/[0.06] bg-[#EDEEF5]/40 p-4 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SmallField label="Language">
                              <input
                                className={inputSm}
                                value={e.language || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, language: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                            <SmallField label="Fluency">
                              <input
                                className={inputSm}
                                value={e.fluency || ""}
                                onChange={(ev) =>
                                  updateBlock(i, {
                                    entries: b.entries.map((x, xi) =>
                                      xi === ei
                                        ? { ...x, fluency: ev.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                          <div className="flex justify-end">
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() =>
                                updateBlock(i, {
                                  entries: b.entries.filter(
                                    (_, xi) => xi !== ei,
                                  ),
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              }

              return null;
            })}
          </main>

          {/* Add Section Button & Popover Menu */}
          <div className="relative pt-2 pb-6">
            <button
              type="button"
              onClick={() => setShowAddSectionMenu((o) => !o)}
              className="w-full border-2 border-dashed border-white/20 hover:border-[#9fff00]/50 hover:bg-[#9fff00]/5 text-gray-300 hover:text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition"
            >
              <span className="text-base font-bold text-[#1a1a1a]">＋</span> Add
              Section
            </button>

            {showAddSectionMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl z-30 space-y-2 max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center pb-1.5 border-b border-black/[0.06] text-xs font-semibold text-gray-300">
                  <span>Available Sections</span>
                  <button
                    type="button"
                    onClick={() => setShowAddSectionMenu(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(TEMPLATES)
                    .filter((type) => type !== "header")
                    .map((type) => {
                      const tpl = TEMPLATES[type];
                      if (!tpl) return null;
                      const title = tpl().title;
                      const exists = blocks.some((b) => b.type === type);
                      const isSingleton = BLOCK_CONFIG[type]?.singleton;
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={isSingleton && exists}
                          onClick={() => {
                            addBlock(type);
                            setShowAddSectionMenu(false);
                          }}
                          className="p-2 text-left rounded-lg text-xs font-medium border border-white/10 bg-white hover:bg-black/[0.03] hover:border-black/[0.2] text-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between transition"
                        >
                          <span className="truncate">{title}</span>
                          <span className="text-[#1a1a1a] font-bold ml-1">
                            +
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Live Pixel-Accurate Resume Preview */}
        <div
          className={`${mobileTab === "editor" ? "hidden lg:flex" : "flex"} flex-1 h-[calc(100vh-64px)] overflow-y-auto bg-[#EDEEF5]/40 p-4 sm:p-6 lg:p-8 flex-col items-center justify-start relative select-none`}
        >
          {/* Sticky Canvas Controls Bar */}
          <div className="sticky top-0 z-20 w-full max-w-4xl flex items-center justify-between px-4 py-2.5 mb-4 rounded-xl bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-sm text-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-200">
                A4 Live Canvas
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% ATS Compliant
              </span>
            </div>

            {/* Zoom & Telemetry Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAtsDrawer((d) => !d)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  showAtsDrawer
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
                title="Toggle ATS Telemetry Copilot"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>ATS Copilot</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  98%
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) =>
                    Math.max(0.5, Math.round((z - 0.1) * 10) / 10),
                  )
                }
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-xs font-mono text-gray-300 min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) =>
                    Math.min(1.4, Math.round((z + 0.1) * 10) / 10),
                  )
                }
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 transition"
              >
                Fit
              </button>
            </div>
          </div>

          {/* A4 Sheet Container */}
          <div
            className="transition-transform duration-150 origin-top shadow-2xl rounded-sm my-2"
            style={{
              transform: `scale(${zoomLevel})`,
              marginBottom: `${(zoomLevel - 1) * 650}px`,
            }}
          >
            {reactPreview}
          </div>

          {/* Off-screen print target for react-to-print */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "-10000px",
              top: 0,
              width: "210mm",
            }}
          >
            {reactPreview}
          </div>
        </div>

        {/* ATS Telemetry Copilot Drawer */}
        <AtsCopilotDrawer
          isOpen={showAtsDrawer}
          onClose={() => setShowAtsDrawer(false)}
          score={98}
          keywordScore={96}
          syntaxScore={100}
          impactScore={94}
          matchedKeywords={[
            "React",
            "TypeScript",
            "Node.js",
            "Docker",
            "REST APIs",
            "Tailwind CSS",
          ]}
          missingKeywords={[
            "CI/CD Pipelines",
            "System Architecture",
            "Kubernetes",
          ]}
        />

        {showTailorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold text-white mb-4">
                Tailor to Job Description
              </h2>
              <textarea
                className="w-full h-32 rounded-xl border border-black/[0.06] bg-[#EDEEF5]/40 p-3 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9fff00]"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              {tailorLoading ? (
                <div className="my-4 text-sm text-[#1a1a1a]">
                  Analyzing your resume against the job description...
                </div>
              ) : tailorSuggestions ? (
                <div className="my-4 space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Suggestions
                  </h3>
                  {tailorSuggestions.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No changes needed! Your resume looks great for this job.
                    </p>
                  )}
                  {tailorSuggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm"
                    >
                      <p className="text-xs text-[#1a1a1a] font-semibold uppercase mb-1">
                        {s.section}
                      </p>
                      <p className="text-[#8e8e8e] mb-2 font-mono text-xs">
                        <strong>Reason:</strong> {s.reason}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded bg-red-900/20 p-2 border border-red-500/20 text-red-200">
                          <span className="block text-xs text-red-400 mb-1">
                            Current
                          </span>
                          {s.current}
                        </div>
                        <div className="rounded bg-green-900/20 p-2 border border-green-500/20 text-green-200">
                          <span className="block text-xs text-green-400 mb-1">
                            Suggested
                          </span>
                          {s.suggested}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTailorModal(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                  Close
                </button>
                {!tailorSuggestions && (
                  <button
                    type="button"
                    onClick={handleTailor}
                    disabled={tailorLoading}
                    className="rounded-lg bg-[#1a1a1a] dark:bg-[#9fff00] px-4 py-2 text-sm text-white hover:bg-[#1a1a1a] dark:bg-[#9fff00] disabled:opacity-50"
                  >
                    Analyze & Tailor
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Career Baseline Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </div>
  );
}
