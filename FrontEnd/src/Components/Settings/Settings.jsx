// src/Components/Settings/Settings.jsx
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

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

  // Screen 5: Live Resource Telemetry & Billing State
  const [telemetry, setTelemetry] = useState({
    activeResumes: 0,
    aiRewrites: 0,
    atsScans: 0,
    renewalDate: null,
    tier: "pro",
    status: "active",
  });

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
          <span>⚙️</span> Screen 5 • Account & ATS Compliance
        </div>
        <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-zinc-100 tracking-tight">
          Account & Preferences
        </h1>
        <p className="mt-1 text-sm text-[#8e8e8e] dark:text-zinc-400">
          Tune your ATS parser compliance rules, AI generation tone, and account
          security.
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
          { id: "ats", label: "🛡️ ATS & Export Defaults" },
          { id: "copilot", label: "✨ AI Copilot Tuning" },
          { id: "quota", label: "⚡ Subscription & Quota" },
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

      {/* TAB 2: ATS & Export Defaults */}
      {activeTab === "ats" && (
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-xl p-6 space-y-6 shadow-sm transition-colors">
          <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-[#1a1a1a] dark:text-zinc-100 flex items-center gap-2">
              <span>🛡️</span> Strict ATS Parser Compliance
            </h2>
            <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1">
              Configure baseline export parameters enforced during PDF
              generation to guarantee 0 extraction dropped fields across top ATS
              platforms.
            </p>
          </div>

          {/* Strict Single Column Enforcer */}
          <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100">
                  Strict Single-Column Enforcement
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1 max-w-xl">
                Prevents multi-column layout shifts that confuse older parsers
                (Taleo, iCIMS). Forces all sections to render sequentially from
                top to bottom.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStrictSingleColumn((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                strictSingleColumn ? "bg-[#1a1a1a] dark:bg-[#9fff00]" : "bg-slate-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                  strictSingleColumn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Date Formatting Radio Group */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Standardized Date Notation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "YYYY-MM",
                  label: "2023-08 (ISO 8601)",
                  desc: "Highest parse accuracy",
                },
                {
                  id: "MM/YYYY",
                  label: "08/2023",
                  desc: "Standard US notation",
                },
                {
                  id: "Month YYYY",
                  label: "August 2023",
                  desc: "Traditional human-readable",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDateFormat(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    dateFormat === opt.id
                      ? "bg-purple-500/10 dark:bg-[#9fff00]/10 border-purple-500 dark:border-[#9fff00] text-[#1a1a1a] dark:text-zinc-100"
                      : "bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PDF Rendering Vector Engine */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              PDF Generation Vector Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportEngine("puppeteer")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  exportEngine === "puppeteer"
                    ? "bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500 text-[#1a1a1a] dark:text-zinc-100"
                    : "bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    Puppeteer Chromium Engine
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 px-2 py-0.5 rounded font-mono">
                    100% Vector
                  </span>
                </div>
                <p className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-1">
                  Exports selectable, zero-rasterization vector text.
                  Machine-readable by all OCR and PDF text stream scrapers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExportEngine("html2canvas")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  exportEngine === "html2canvas"
                    ? "bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500 text-[#1a1a1a] dark:text-zinc-100"
                    : "bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                    Client-Side Canvas Print
                  </span>
                  <span className="text-[10px] bg-black/[0.05] dark:bg-white/10 text-[#8e8e8e] dark:text-zinc-400 px-2 py-0.5 rounded">
                    Fallback
                  </span>
                </div>
                <p className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-1">
                  Fast client-side export without calling backend headless
                  browser services.
                </p>
              </button>
            </div>
          </div>

          {/* Embed ATS JSON Metadata */}
          <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100">
                Embed Machine-Readable JSON-LD Metadata
              </span>
              <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1 max-w-xl">
                Injects an invisible JSON schema into the PDF document
                properties matching{" "}
                <code className="text-purple-600 dark:text-purple-400">schema.org/Resume</code> for
                next-gen AI parsers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmbedAtsJson((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                embedAtsJson ? "bg-[#1a1a1a] dark:bg-[#9fff00]" : "bg-slate-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                  embedAtsJson ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveAtsDefaults}
              className="px-6 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] text-white dark:text-black text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save ATS Defaults"}
            </button>
          </div>
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

      {/* TAB 4: Subscription & Quota */}
      {activeTab === "quota" && (() => {
        const isPro = telemetry.tier === "pro";
        const maxResumes = isPro ? 25 : 3;
        const maxRewrites = isPro ? 500 : 50;
        const maxScans = isPro ? 100 : 10;
        const renewalStr = telemetry.renewalDate
          ? new Date(telemetry.renewalDate).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "in 30 days";
        const resumePct = Math.min(
          100,
          Math.round((telemetry.activeResumes / maxResumes) * 100),
        );
        const rewritePct = Math.min(
          100,
          Math.round((telemetry.aiRewrites / maxRewrites) * 100),
        );
        const scanPct = Math.min(
          100,
          Math.round((telemetry.atsScans / maxScans) * 100),
        );

        return (
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-xl p-6 space-y-6 shadow-sm transition-colors">
            {/* Plan Header Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-950 dark:from-purple-950/40 dark:via-zinc-900 dark:to-zinc-950 border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">
                    {isPro ? "Pro ATS Architect Tier" : "Starter Free Tier"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 font-mono">
                    {telemetry.status === "active" ? "Active" : "Standard"}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Your billing cycle renews on <strong>{renewalStr}</strong>.
                  {isPro
                    ? " Unlimited tailoring scans and priority AI fallback included."
                    : " Upgrade to Pro for unlimited AI tailoring and 25 active resume slots."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleToggleTier(isPro ? "free" : "pro")}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isPro ? "Switch to Free Tier" : "Upgrade to Pro Tier"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResetQuota}
                  title="Reset 30-day monthly quotas for testing"
                  className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-semibold border border-purple-500/40 transition cursor-pointer disabled:opacity-50"
                >
                  Reset Quota
                </button>
              </div>
            </div>

            {/* Usage Meters */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
                Monthly Resource Telemetry (Live Database Count)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Meter 1: Resumes */}
                <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8e8e8e] dark:text-zinc-400">
                      Active Resumes
                    </span>
                    <span className="font-mono text-[#1a1a1a] dark:text-zinc-100 font-bold">
                      {telemetry.activeResumes} / {maxResumes}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#EDEEF5] dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${resumePct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#8e8e8e] dark:text-zinc-400">
                    {Math.max(0, maxResumes - telemetry.activeResumes)} slots
                    remaining
                  </div>
                </div>

                {/* Meter 2: Bullet Rewrites */}
                <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8e8e8e] dark:text-zinc-400">
                      AI Bullet Rewrites
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {telemetry.aiRewrites} / {maxRewrites}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#EDEEF5] dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${rewritePct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#8e8e8e] dark:text-zinc-400">
                    Cycle renews on {renewalStr}
                  </div>
                </div>

                {/* Meter 3: Match Scans */}
                <div className="p-4 rounded-xl bg-[#EDEEF5]/40 dark:bg-zinc-800/60 border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8e8e8e] dark:text-zinc-400">
                      ATS Match Scans
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {telemetry.atsScans} / {maxScans}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#EDEEF5] dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${scanPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#8e8e8e] dark:text-zinc-400">
                    {Math.max(0, maxScans - telemetry.atsScans)} scans remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Entitlements */}
            <div className="p-5 rounded-2xl bg-[#EDEEF5]/30 dark:bg-zinc-800/40 border border-black/[0.06] dark:border-white/[0.08]">
              <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100 uppercase tracking-wider mb-3">
                {isPro ? "Included Pro Features" : "Starter Tier Limits"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Deterministic ATS Rule Scoring Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>
                    Workday, Lever, and Greenhouse AST parse diagnostics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Vector text PDF headless Chromium rendering</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>
                    Machine-Readable JSON-LD (schema.org/Resume) metadata
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
