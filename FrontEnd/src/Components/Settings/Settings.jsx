// src/Components/Settings/Settings.jsx
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Sparkles, Wand2, Loader2, Bot, Check } from "lucide-react";

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login"; // Force a full page reload to clear all state
    }
    return Promise.reject(error);
  },
);

export default function Settings() {
  const { user, setUser, loading: userLoading } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Screen 5: ATS Compliance Defaults
  const [strictSingleColumn, setStrictSingleColumn] = useState(true);
  const [dateFormat, setDateFormat] = useState("YYYY-MM");
  const [exportEngine, setExportEngine] = useState("puppeteer");
  const [embedAtsJson, setEmbedAtsJson] = useState(true);

  // Screen 5: AI Copilot Tuning
  const [copilotTone, setCopilotTone] = useState("metrics");
  const [keywordDensity, setKeywordDensity] = useState(85);
  const [aiModel, setAiModel] = useState("gemini-pro");

  // Live Resource Telemetry & Billing State
  const [telemetry, setTelemetry] = useState({
    activeResumes: 0,
    aiRewrites: 0,
    atsScans: 0,
    renewalDate: null,
    tier: "pro",
    status: "active",
  });

  // Career Baseline Profile (CareerOps) State
  const [careerRole, setCareerRole] = useState("Senior Full Stack Engineer");
  const [careerSeniority, setCareerSeniority] = useState("Senior (5-8 yrs)");
  const [careerBio, setCareerBio] = useState("");
  const [careerPhone, setCareerPhone] = useState("");
  const [careerLocation, setCareerLocation] = useState("");
  const [careerLinkedin, setCareerLinkedin] = useState("");
  const [careerGithub, setCareerGithub] = useState("");
  const [careerWebsite, setCareerWebsite] = useState("");
  const [careerSkills, setCareerSkills] = useState([
    "TypeScript",
    "React",
    "Node.js",
    "Docker",
    "REST APIs",
    "System Architecture",
  ]);
  const [careerSkillInput, setCareerSkillInput] = useState("");
  const [careerExperiences, setCareerExperiences] = useState([
    {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      highlights: [""],
    },
  ]);
  const [careerEducation, setCareerEducation] = useState([
    {
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
    },
  ]);
  const [careerProjects, setCareerProjects] = useState([]);
  const [careerSaving, setCareerSaving] = useState(false);
  // CareerOps AI Copilot State
  const [showAiExtractor, setShowAiExtractor] = useState(false);
  const [rawCareerNotes, setRawCareerNotes] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiPolishingBio, setAiPolishingBio] = useState(false);
  const [aiSuggestingSkills, setAiSuggestingSkills] = useState(false);
  const [aiEnrichingExpIdx, setAiEnrichingExpIdx] = useState(null);

  const addCareerSkill = (skillToAdd) => {
    const s = (skillToAdd || careerSkillInput).trim();
    if (!s) return;
    if (!careerSkills.includes(s)) {
      setCareerSkills([...careerSkills, s]);
    }
    setCareerSkillInput("");
  };

  const removeCareerSkill = (skillToRemove) => {
    setCareerSkills(careerSkills.filter((s) => s !== skillToRemove));
  };

  const addCareerExperience = () => {
    setCareerExperiences([
      ...careerExperiences,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        highlights: [""],
      },
    ]);
  };

  const updateCareerExperience = (index, field, value) => {
    const updated = [...careerExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setCareerExperiences(updated);
  };

  const removeCareerExperience = (index) => {
    setCareerExperiences(careerExperiences.filter((_, i) => i !== index));
  };

  const addExperienceBullet = (expIndex) => {
    const updated = [...careerExperiences];
    const currentHighlights = updated[expIndex].highlights || [];
    updated[expIndex] = {
      ...updated[expIndex],
      highlights: [...currentHighlights, ""],
    };
    setCareerExperiences(updated);
  };

  const updateExperienceBullet = (expIndex, bulletIndex, value) => {
    const updated = [...careerExperiences];
    const currentHighlights = [...(updated[expIndex].highlights || [])];
    currentHighlights[bulletIndex] = value;
    updated[expIndex] = { ...updated[expIndex], highlights: currentHighlights };
    setCareerExperiences(updated);
  };

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    const updated = [...careerExperiences];
    const currentHighlights = updated[expIndex].highlights.filter((_, i) => i !== bulletIndex);
    updated[expIndex] = { ...updated[expIndex], highlights: currentHighlights };
    setCareerExperiences(updated);
  };

  const addCareerEducation = () => {
    setCareerEducation([
      ...careerEducation,
      { institution: "", degree: "", startDate: "", endDate: "" },
    ]);
  };

  const updateCareerEducation = (index, field, value) => {
    const updated = [...careerEducation];
    updated[index] = { ...updated[index], [field]: value };
    setCareerEducation(updated);
  };

  const removeCareerEducation = (index) => {
    setCareerEducation(careerEducation.filter((_, i) => i !== index));
  };

  const addCareerProject = () => {
    setCareerProjects([
      ...careerProjects,
      { name: "", description: "", technologies: "", url: "" },
    ]);
  };

  const updateCareerProject = (index, field, value) => {
    const updated = [...careerProjects];
    updated[index] = { ...updated[index], [field]: value };
    setCareerProjects(updated);
  };

  const removeCareerProject = (index) => {
    setCareerProjects(careerProjects.filter((_, i) => i !== index));
  };

  const handleSaveCareerProfile = async (e) => {
    if (e) e.preventDefault();
    setCareerSaving(true);
    setMessage({ type: "", content: "" });
    try {
      const payload = {
        fullName,
        targetRole: careerRole,
        seniority: careerSeniority,
        bio: careerBio,
        phone: careerPhone,
        location: careerLocation,
        linkedin: careerLinkedin,
        github: careerGithub,
        website: careerWebsite,
        skills: careerSkills,
        experiences: careerExperiences,
        education: careerEducation,
        projects: careerProjects,
      };
      const res = await api.put("/user/career-profile", payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setMessage({
        type: "success",
        content: "Master Career Baseline Profile (CareerOps) saved successfully! All new resumes will derive from this profile.",
      });
    } catch (err) {
      console.error("Save career profile error:", err);
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to save career baseline profile.",
      });
    } finally {
      setCareerSaving(false);
    }
  };

  const handleAiExtractBaseline = async () => {
    if (!rawCareerNotes.trim()) {
      setMessage({
        type: "error",
        content: "Please enter your raw notes, past resume, or LinkedIn summary first.",
      });
      return;
    }
    setAiExtracting(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/ai", {
        scope: "career-ops",
        action: "extract-baseline",
        rawText: rawCareerNotes,
        careerProfile: {
          targetRole: careerRole,
          seniority: careerSeniority,
        },
      });
      const p = res.data?.careerProfile;
      if (p) {
        if (p.fullName) setFullName(p.fullName);
        if (p.targetRole) setCareerRole(p.targetRole);
        if (p.seniority) setCareerSeniority(p.seniority);
        if (p.bio) setCareerBio(p.bio);
        if (p.phone) setCareerPhone(p.phone);
        if (p.location) setCareerLocation(p.location);
        if (p.linkedin) setCareerLinkedin(p.linkedin);
        if (p.github) setCareerGithub(p.github);
        if (p.website) setCareerWebsite(p.website);
        if (Array.isArray(p.skills) && p.skills.length > 0) setCareerSkills(p.skills);
        if (Array.isArray(p.experiences) && p.experiences.length > 0) {
          setCareerExperiences(
            p.experiences.map((exp) => {
              const dates = typeof exp.dates === "string" ? exp.dates.split(/[-–—]/) : [];
              const rawBullets = Array.isArray(exp.highlights) && exp.highlights.length > 0
                ? exp.highlights
                : Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0
                  ? exp.bulletPoints
                  : Array.isArray(exp.bullets) && exp.bullets.length > 0
                    ? exp.bullets
                    : [""];
              return {
                company: exp.company || "",
                position: exp.position || exp.role || "",
                startDate: exp.startDate || (dates[0] ? dates[0].trim() : ""),
                endDate: exp.endDate || (dates[1] ? dates[1].trim() : ""),
                highlights: rawBullets,
              };
            })
          );
        }
        if (Array.isArray(p.education) && p.education.length > 0) {
          setCareerEducation(
            p.education.map((edu) => ({
              institution: edu.institution || "",
              degree: edu.degree || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
            }))
          );
        }
        if (Array.isArray(p.projects) && p.projects.length > 0) {
          setCareerProjects(
            p.projects.map((proj) => ({
              name: proj.name || proj.title || "",
              description: proj.description || proj.summary || "",
              technologies: proj.technologies || proj.techStack || "",
              url: proj.url || proj.link || "",
            }))
          );
        }
        setMessage({
          type: "success",
          content: "✨ Career baseline auto-extracted successfully by AI! Review below and click 'Save Career Baseline Profile'.",
        });
        setShowAiExtractor(false);
      }
    } catch (err) {
      console.error("AI Extract Baseline error:", err);
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to auto-extract career baseline with AI.",
      });
    } finally {
      setAiExtracting(false);
    }
  };

  const handleAiPolishBio = async () => {
    setAiPolishingBio(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/ai", {
        scope: "career-ops",
        action: "polish-bio",
        targetRole: careerRole,
        seniority: careerSeniority,
        skills: careerSkills,
        experiences: careerExperiences,
        currentBio: careerBio,
      });
      if (res.data?.bio) {
        setCareerBio(res.data.bio);
        setMessage({
          type: "success",
          content: "✨ Master career bio polished with executive clarity by AI!",
        });
      }
    } catch (err) {
      console.error("AI Polish Bio error:", err);
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to polish career bio with AI.",
      });
    } finally {
      setAiPolishingBio(false);
    }
  };

  const handleAiSuggestSkills = async () => {
    setAiSuggestingSkills(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/ai", {
        scope: "career-ops",
        action: "suggest-skills",
        targetRole: careerRole,
        seniority: careerSeniority,
        currentSkills: careerSkills,
        experiences: careerExperiences,
      });
      const suggested = res.data?.skills || [];
      if (Array.isArray(suggested) && suggested.length > 0) {
        const merged = Array.from(new Set([...careerSkills, ...suggested]));
        setCareerSkills(merged);
        setMessage({
          type: "success",
          content: `✨ Added ${suggested.length} recommended industry skills matching your role and domain!`,
        });
      } else {
        setMessage({
          type: "info",
          content: "Your skills inventory already includes the recommended core skills for this role.",
        });
      }
    } catch (err) {
      console.error("AI Suggest Skills error:", err);
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to suggest skills with AI.",
      });
    } finally {
      setAiSuggestingSkills(false);
    }
  };

  const handleAiEnrichExperience = async (expIdx) => {
    const exp = careerExperiences[expIdx];
    if (!exp) return;
    setAiEnrichingExpIdx(expIdx);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/ai", {
        scope: "career-ops",
        action: "enrich-experience",
        experience: exp,
      });
      const highlights = res.data?.highlights;
      if (Array.isArray(highlights) && highlights.length > 0) {
        const updated = [...careerExperiences];
        updated[expIdx] = {
          ...updated[expIdx],
          highlights: highlights,
        };
        setCareerExperiences(updated);
        setMessage({
          type: "success",
          content: `✨ Experience bullets for ${exp.company || exp.position || "role"} enriched with action verbs and metrics!`,
        });
      }
    } catch (err) {
      console.error("AI Enrich Experience error:", err);
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to enrich experience bullets with AI.",
      });
    } finally {
      setAiEnrichingExpIdx(null);
    }
  };

  const fetchSettingsAndTelemetry = async () => {
    try {
      const res = await api.get("/user/settings");
      if (res.data) {
        const { preferences, subscription, usage } = res.data;
        if (preferences?.ats) {
          setStrictSingleColumn(preferences.ats.strictSingleColumn ?? true);
          setDateFormat(preferences.ats.dateFormat || "YYYY-MM");
          setExportEngine(preferences.ats.exportEngine || "puppeteer");
          setEmbedAtsJson(preferences.ats.embedAtsJson ?? true);
        }
        if (preferences?.copilot) {
          setCopilotTone(preferences.copilot.tone || "metrics");
          setKeywordDensity(preferences.copilot.keywordDensity || 85);
          setAiModel(preferences.copilot.aiModel || "gemini-pro");
        }
        setTelemetry({
          activeResumes: usage?.activeResumes || 0,
          aiRewrites: usage?.aiRewrites || 0,
          atsScans: usage?.atsScans || 0,
          renewalDate: subscription?.renewalDate,
          tier: subscription?.tier || "pro",
          status: subscription?.status || "active",
        });
      }
    } catch (err) {
      console.warn("Failed to fetch settings telemetry:", err);
    }
  };

  useEffect(() => {
    fetchSettingsAndTelemetry();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhotoPreview(user.photo || "");

      if (user.preferences?.ats) {
        setStrictSingleColumn(user.preferences.ats.strictSingleColumn ?? true);
        setDateFormat(user.preferences.ats.dateFormat || "YYYY-MM");
        setExportEngine(user.preferences.ats.exportEngine || "puppeteer");
        setEmbedAtsJson(user.preferences.ats.embedAtsJson ?? true);
      }
      if (user.preferences?.copilot) {
        setCopilotTone(user.preferences.copilot.tone || "metrics");
        setKeywordDensity(user.preferences.copilot.keywordDensity || 85);
        setAiModel(user.preferences.copilot.aiModel || "gemini-pro");
      }
      if (user.subscription) {
        setTelemetry((prev) => ({
          ...prev,
          tier: user.subscription.tier || prev.tier,
          status: user.subscription.status || prev.status,
          renewalDate: user.subscription.renewalDate || prev.renewalDate,
        }));
      }
      if (user.usage) {
        setTelemetry((prev) => ({
          ...prev,
          activeResumes: user.usage.activeResumes ?? prev.activeResumes,
          aiRewrites: user.usage.aiRewrites ?? prev.aiRewrites,
          atsScans: user.usage.atsScans ?? prev.atsScans,
        }));
      }

      if (user.careerProfile) {
        const cp = user.careerProfile;
        if (cp.targetRole) setCareerRole(cp.targetRole);
        if (cp.seniority) setCareerSeniority(cp.seniority);
        if (cp.bio) setCareerBio(cp.bio);
        if (cp.phone) setCareerPhone(cp.phone);
        if (cp.location) setCareerLocation(cp.location);
        if (cp.linkedin) setCareerLinkedin(cp.linkedin);
        if (cp.github) setCareerGithub(cp.github);
        if (cp.website) setCareerWebsite(cp.website);
        if (Array.isArray(cp.skills) && cp.skills.length > 0) setCareerSkills(cp.skills);
        if (Array.isArray(cp.experiences) && cp.experiences.length > 0) setCareerExperiences(cp.experiences);
        if (Array.isArray(cp.education) && cp.education.length > 0) setCareerEducation(cp.education);
        if (Array.isArray(cp.projects)) setCareerProjects(cp.projects);
      }
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateName = () => {
    if (!fullName.trim()) {
      setNameError("Full name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const validatePassword = () => {
    if (newPassword && newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    const isNameValid = validateName();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isNameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const payload = { fullName, newPassword, currentPassword };
      if (photo) payload.photo = photo;

      const res = await api.put("/user/profile", payload);
      setUser(res.data.user);
      setMessage({
        type: "success",
        content: "Profile updated successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAtsDefaults = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const payload = {
        ats: {
          strictSingleColumn,
          dateFormat,
          exportEngine,
          embedAtsJson,
        },
      };
      const res = await api.put("/user/settings", payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setMessage({
        type: "success",
        content: "ATS compliance settings saved to database!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to save ATS defaults.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCopilotTuning = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const payload = {
        copilot: {
          tone: copilotTone,
          keywordDensity,
          aiModel,
        },
      };
      const res = await api.put("/user/settings", payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setMessage({
        type: "success",
        content: "AI Copilot tuning preferences saved to database!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to save Copilot tuning.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTier = async (newTier) => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/user/subscription", { tier: newTier });
      if (res.data?.user) {
        setUser(res.data.user);
        setTelemetry((prev) => ({
          ...prev,
          tier: res.data.subscription?.tier || newTier,
        }));
        setMessage({
          type: "success",
          content: `Subscription tier switched to ${newTier.toUpperCase()}!`,
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to update subscription tier.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuota = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await api.post("/user/subscription", { action: "reset_quota" });
      if (res.data?.user) {
        setUser(res.data.user);
        setTelemetry((prev) => ({
          ...prev,
          aiRewrites: 0,
          atsScans: 0,
          renewalDate: res.data.subscription?.renewalDate,
        }));
        setMessage({
          type: "success",
          content: "Monthly telemetry quota successfully reset for testing!",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to reset quota.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-sm font-medium text-[#8e8e8e]">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-2 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 bg-gradient-to-b from-black/[0.03] to-transparent blur-2xl" />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9fff00]/20 border border-[#9fff00] text-[#1a1a1a] dark:text-[#9fff00] text-xs font-semibold mb-2">
          <span>⚙️</span> Account & Career Baseline Settings
        </div>
        <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-zinc-100 tracking-tight">
          Account & Preferences
        </h1>
        <p className="mt-1 text-sm text-[#8e8e8e] dark:text-zinc-400">
          Manage your master career baseline (CareerOps), ATS parser compliance rules, AI generation tone, and account security.
        </p>
      </div>

      {/* Status Alert */}
      {message.content && (
        <div
          className={`mb-6 p-4 rounded-2xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          } flex items-center justify-between text-xs font-semibold`}
        >
          <div className="flex items-center gap-2">
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            <span>{message.content}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ type: "", content: "" })}
            className="text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Structured Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-black/[0.06] dark:border-white/[0.08] scrollbar-none">
        {[
          { id: "profile", label: "👤 Profile & Security" },
          { id: "career", label: "💼 Career Baseline (CareerOps)" },
          { id: "copilot", label: "✨ AI Copilot Tuning" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#1a1a1a] dark:bg-[#9fff00] text-white dark:text-black shadow-xs rounded-full font-semibold"
                : "bg-white dark:bg-zinc-900 text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-full border border-black/[0.08] dark:border-white/[0.08]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Profile & Security */}
      {activeTab === "profile" && (
        <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors">
          <form onSubmit={handleProfileUpdate}>
            <div className="px-6 py-6 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h2 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 mb-6 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-black/[0.06] dark:border-white/[0.1] bg-[#EDEEF5] dark:bg-zinc-800 flex items-center justify-center shadow-lg">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-extrabold text-[#8e8e8e] dark:text-zinc-400">
                          {fullName.charAt(0).toUpperCase() ||
                            email.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 cursor-pointer bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] text-white dark:text-black p-2 rounded-xl shadow-md transition border border-white/20">
                      <span className="text-xs">📷</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <p className="mt-3 text-[11px] text-[#8e8e8e] dark:text-zinc-400 text-center max-w-[160px]">
                    PNG, JPG or WebP • Max 5MB
                  </p>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      className={`w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition text-xs ${
                        nameError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-black/[0.08] dark:border-white/[0.1] focus:ring-black/20 dark:focus:ring-white/20"
                      }`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={validateName}
                      disabled={loading}
                      placeholder="e.g. Alex Morgan"
                    />
                    {nameError && (
                      <p className="text-red-400 text-xs mt-1">{nameError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Account Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#8e8e8e] dark:text-zinc-400 text-xs cursor-not-allowed"
                        value={email}
                        readOnly
                        disabled
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono border border-emerald-500/30">
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="px-6 py-6">
              <h2 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 mb-4 flex items-center gap-2">
                <span>🔒</span> Security & Password
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition text-xs ${
                      passwordError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-black/[0.08] dark:border-white/[0.1] focus:ring-black/20 dark:focus:ring-white/20"
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={validatePassword}
                    disabled={loading}
                    placeholder="Min 8 characters"
                  />
                  {passwordError && (
                    <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition text-xs ${
                      confirmPasswordError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-black/[0.08] dark:border-white/[0.1] focus:ring-black/20 dark:focus:ring-white/20"
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={validateConfirmPassword}
                    disabled={loading}
                    placeholder="Repeat new password"
                  />
                  {confirmPasswordError && (
                    <p className="text-red-400 text-xs mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#EDEEF5]/30 dark:bg-zinc-800/40 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] disabled:opacity-50 text-white dark:text-black text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                {loading ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Career Baseline Profile (CareerOps) */}
      {activeTab === "career" && (
        <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors">
          <form onSubmit={handleSaveCareerProfile}>
            {/* Header info */}
            <div className="px-6 py-6 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 flex items-center gap-2">
                    <span>💼</span> Master Career Baseline Profile (CareerOps)
                  </h2>
                  <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1">
                    Your single source of truth for all resumes and AI tailoring. Edit your master baseline once, and all new resumes will seed and sync directly from this data.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiExtractor(!showAiExtractor)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showAiExtractor ? "Close AI Auto-Pilot" : "✨ AI Auto-Pilot"}</span>
                  </button>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#9fff00]/20 text-[#1a1a1a] dark:text-[#9fff00] border border-[#9fff00]">
                    CareerOps Sync Ready
                  </span>
                </div>
              </div>

              {/* Collapsible AI Auto-Pilot Box */}
              {showAiExtractor && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                        AI Career Baseline Auto-Pilot
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Paste unformatted notes, an old CV, or a LinkedIn summary. AI will parse, structure, and populate your entire master profile without inventing fake details.
                      </p>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={rawCareerNotes}
                    onChange={(e) => setRawCareerNotes(e.target.value)}
                    placeholder="Paste unformatted resume text, notes, LinkedIn 'About' & work history here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-800 text-xs text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiExtractor(false)}
                      className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={aiExtracting || !rawCareerNotes.trim()}
                      onClick={handleAiExtractBaseline}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      {aiExtracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting Baseline with AI...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Auto-Extract Master Baseline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Target Role & Seniority */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  🎯 Target Role & Seniority
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Target Role / Professional Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerRole}
                      onChange={(e) => setCareerRole(e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Career Seniority Level
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerSeniority}
                      onChange={(e) => setCareerSeniority(e.target.value)}
                    >
                      <option value="Entry / Associate (0-2 yrs)">Entry / Associate (0-2 yrs)</option>
                      <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                      <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                      <option value="Staff / Principal (8+ yrs)">Staff / Principal (8+ yrs)</option>
                      <option value="Director / Executive">Director / Executive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact & Profiles */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  📍 Contact & Online Profiles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Direct Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerPhone}
                      onChange={(e) => setCareerPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Location (City, State/Country)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerLocation}
                      onChange={(e) => setCareerLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Portfolio / Personal Website
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerWebsite}
                      onChange={(e) => setCareerWebsite(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerLinkedin}
                      onChange={(e) => setCareerLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      GitHub Profile URL
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                      value={careerGithub}
                      onChange={(e) => setCareerGithub(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Master Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    📝 Master Professional Bio / Summary
                  </h3>
                  <button
                    type="button"
                    disabled={aiPolishingBio}
                    onClick={handleAiPolishBio}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition cursor-pointer disabled:opacity-50"
                  >
                    {aiPolishingBio ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Polishing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI Polish Bio</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs leading-relaxed"
                  value={careerBio}
                  onChange={(e) => setCareerBio(e.target.value)}
                  placeholder="Senior software engineer with 6+ years leading cloud-native architectures, microservices, and high-throughput systems..."
                />
              </div>

              {/* Core Skills Inventory */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    ⚡ Core Technical Skills Inventory
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={aiSuggestingSkills}
                      onClick={handleAiSuggestSkills}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition cursor-pointer disabled:opacity-50"
                    >
                      {aiSuggestingSkills ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Suggesting Skills...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>AI Suggest Skills</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-zinc-400">
                      {careerSkills.length} skills listed
                    </span>
                  </div>
                </div>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#EDEEF5]/40 dark:bg-zinc-800/40 border border-black/[0.06] dark:border-white/[0.08] min-h-[48px] items-center mb-3">
                  {careerSkills.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">No skills added yet. Add your core skills below.</span>
                  ) : (
                    careerSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.1] shadow-xs"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => removeCareerSkill(sk)}
                          className="text-zinc-400 hover:text-rose-500 text-xs cursor-pointer ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Skill Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition text-xs"
                    value={careerSkillInput}
                    onChange={(e) => setCareerSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCareerSkill();
                      }
                    }}
                    placeholder="Type a skill (e.g. Kubernetes) and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => addCareerSkill()}
                    className="px-4 py-2.5 bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold transition"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Quick Add:</span>
                  {[
                    "TypeScript",
                    "React",
                    "Node.js",
                    "Python",
                    "Docker",
                    "Kubernetes",
                    "AWS",
                    "GraphQL",
                    "PostgreSQL",
                    "System Architecture",
                    "CI/CD",
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addCareerSkill(sug)}
                      disabled={careerSkills.includes(sug)}
                      className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] disabled:opacity-40 transition cursor-pointer text-zinc-600 dark:text-zinc-300"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Work Experience History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    🏢 Master Work Experience History
                  </h3>
                  <button
                    type="button"
                    onClick={addCareerExperience}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    + Add Experience Role
                  </button>
                </div>

                <div className="space-y-4">
                  {careerExperiences.map((exp, expIdx) => (
                    <div
                      key={expIdx}
                      className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#EDEEF5]/20 dark:bg-zinc-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Role #{expIdx + 1}
                        </span>
                        {careerExperiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCareerExperience(expIdx)}
                            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                          >
                            ✕ Remove Role
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Company
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={exp.company || ""}
                            onChange={(e) => updateCareerExperience(expIdx, "company", e.target.value)}
                            placeholder="e.g. Acme Tech"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Position / Title
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={exp.position || ""}
                            onChange={(e) => updateCareerExperience(expIdx, "position", e.target.value)}
                            placeholder="e.g. Lead Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={exp.startDate || ""}
                            onChange={(e) => updateCareerExperience(expIdx, "startDate", e.target.value)}
                            placeholder="e.g. 2021-03"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={exp.endDate || ""}
                            onChange={(e) => updateCareerExperience(expIdx, "endDate", e.target.value)}
                            placeholder="e.g. Present"
                          />
                        </div>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Key Accomplishments / Metrics Bullets
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={aiEnrichingExpIdx === expIdx}
                              onClick={() => handleAiEnrichExperience(expIdx)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition cursor-pointer disabled:opacity-50"
                            >
                              {aiEnrichingExpIdx === expIdx ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Enriching...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Enrich Bullets</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => addExperienceBullet(expIdx)}
                              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              + Add Bullet
                            </button>
                          </div>
                        </div>
                        {(exp.highlights || [""]).map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <span className="text-zinc-400 text-xs">•</span>
                            <input
                              type="text"
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                              value={bullet}
                              onChange={(e) => updateExperienceBullet(expIdx, bIdx, e.target.value)}
                              placeholder="e.g. Scaled database throughput by 42% through query caching..."
                            />
                            {exp.highlights && exp.highlights.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperienceBullet(expIdx, bIdx)}
                                className="text-zinc-400 hover:text-rose-500 text-xs px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    🎓 Master Education & Credentials
                  </h3>
                  <button
                    type="button"
                    onClick={addCareerEducation}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    + Add Education
                  </button>
                </div>

                <div className="space-y-3">
                  {careerEducation.map((edu, eduIdx) => (
                    <div
                      key={eduIdx}
                      className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#EDEEF5]/20 dark:bg-zinc-800/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Institution
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                          value={edu.institution || ""}
                          onChange={(e) => updateCareerEducation(eduIdx, "institution", e.target.value)}
                          placeholder="e.g. University of California, Berkeley"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Degree / Major
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                          value={edu.degree || ""}
                          onChange={(e) => updateCareerEducation(eduIdx, "degree", e.target.value)}
                          placeholder="B.S. Computer Science"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Years
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={edu.endDate || ""}
                            onChange={(e) => updateCareerEducation(eduIdx, "endDate", e.target.value)}
                            placeholder="e.g. 2018 - 2022"
                          />
                        </div>
                        {careerEducation.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCareerEducation(eduIdx)}
                            className="text-rose-500 hover:text-rose-600 text-xs font-semibold p-2"
                            title="Remove education"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    🚀 Key Projects & Portfolio
                  </h3>
                  <button
                    type="button"
                    onClick={addCareerProject}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    + Add Project
                  </button>
                </div>

                <div className="space-y-4">
                  {careerProjects.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] text-center text-xs text-zinc-400">
                      No standalone projects added yet. Click "+ Add Project" or extract from your notes with AI above.
                    </div>
                  ) : (
                    careerProjects.map((proj, projIdx) => (
                      <div
                        key={projIdx}
                        className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#EDEEF5]/20 dark:bg-zinc-800/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            Project #{projIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCareerProject(projIdx)}
                            className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                          >
                            ✕ Remove Project
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              Project Name / Title
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                              value={proj.name || ""}
                              onChange={(e) => updateCareerProject(projIdx, "name", e.target.value)}
                              placeholder="e.g. AI Resume Builder"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              Project Link / Repo URL
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                              value={proj.url || ""}
                              onChange={(e) => updateCareerProject(projIdx, "url", e.target.value)}
                              placeholder="e.g. https://github.com/user/project"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Technologies Used
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100"
                            value={proj.technologies || ""}
                            onChange={(e) => updateCareerProject(projIdx, "technologies", e.target.value)}
                            placeholder="e.g. React, Node.js, Tailwind CSS, OpenAI API"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Description & Key Achievements
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1a1a1a] dark:text-zinc-100 resize-none"
                            value={proj.description || ""}
                            onChange={(e) => updateCareerProject(projIdx, "description", e.target.value)}
                            placeholder="Architected full-stack resume platform serving 5k+ users with instant ATS score validation..."
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#EDEEF5]/30 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Data is saved directly to your MongoDB account.
              </span>
              <button
                type="submit"
                disabled={careerSaving}
                className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] disabled:opacity-50 text-white dark:text-black text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                {careerSaving ? "Saving Baseline..." : "💾 Save Career Baseline Profile"}
              </button>
            </div>
          </form>
        </div>
      )}



      {/* TAB 3: AI Copilot Tuning */}
      {activeTab === "copilot" && (
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-xl p-6 space-y-6 shadow-sm transition-colors">
          <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-[#1a1a1a] dark:text-zinc-100 flex items-center gap-2">
              <span>✨</span> AI Copilot Persona & Voice Tuning
            </h2>
            <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1">
              Calibrate how your resume bullets and summaries are phrased during
              AI optimization passes.
            </p>
          </div>

          {/* Tone of Voice Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Writing Style & Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "metrics",
                  name: "Outcome & Metrics-Driven",
                  desc: "Led with hard KPIs, % improvements, and business revenue impact.",
                  badge: "Highest Callbacks",
                },
                {
                  id: "direct",
                  name: "Direct & Highly Technical",
                  desc: "Focuses on toolstacks, architectural complexity, and algorithms.",
                  badge: "Best for Eng",
                },
                {
                  id: "executive",
                  name: "Executive & Strategic",
                  desc: "Emphasizes cross-functional leadership, vision, and team scaling.",
                  badge: "Directors / VPs",
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCopilotTone(t.id)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    copilotTone === t.id
                      ? "bg-purple-500/10 dark:bg-[#9fff00]/10 border-purple-500 dark:border-[#9fff00] text-[#1a1a1a] dark:text-zinc-100 shadow-sm"
                      : "bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-1 leading-relaxed">
                      {t.desc}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">
                      {t.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Aggressiveness Slider */}
          <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                  Target Keyword Density Aggressiveness
                </span>
                <p className="text-[11px] text-[#8e8e8e] dark:text-zinc-400">
                  Balances readability for hiring managers vs strict keyword
                  density for automated ATS screening algorithms.
                </p>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {keywordDensity}%
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="98"
              value={keywordDensity}
              onChange={(e) => setKeywordDensity(Number(e.target.value))}
              className="w-full accent-purple-600 dark:accent-[#9fff00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8e8e8e] dark:text-zinc-400 font-mono">
              <span>65% Natural Storytelling</span>
              <span>85% Balanced (Ideal)</span>
              <span>98% High ATS Density</span>
            </div>
          </div>

          {/* Preferred LLM */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Underlying LLM Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "gemini-pro",
                  name: "Gemini 1.5 Pro / Flash",
                  desc: "Ultra-fast context matching with Deepmind resume fine-tuning.",
                },
                {
                  id: "gpt-4o",
                  name: "Claude 3.5 / OpenAI GPT-4o",
                  desc: "Standard reasoning model for bullet structuring.",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAiModel(m.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    aiModel === m.id
                      ? "bg-purple-500/10 dark:bg-[#9fff00]/10 border-purple-500 dark:border-[#9fff00] text-[#1a1a1a] dark:text-zinc-100"
                      : "bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="text-xs font-bold">{m.name}</div>
                  <div className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveCopilotTuning}
              className="px-6 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] text-white dark:text-black text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Copilot Tuning"}
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
