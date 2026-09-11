import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Download, Check, Loader2, Sparkles, Briefcase } from "lucide-react";
import Logo from "../../common/Logo";
import ThemeToggle from "../../../Context/ThemeToggle";

const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " seconds ago";
};

const EditorTopBar = ({
  resumeName = "Untitled Resume",
  onResumeNameChange,
  saveStatus = "saved",
  lastSavedAt,
  onSave,
  onDownloadPdf,
  rendering = false,
  atsScore = 96,
  onToggleAtsDrawer,
  onToggleAiAssistant,
  showAiAssistant = false,
  onBackToDashboard,
  onSyncCareerProfile,
}) => {

  const [timeText, setTimeText] = useState(timeAgo(lastSavedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeText(timeAgo(lastSavedAt));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <div className="flex items-center text-[#8e8e8e] dark:text-zinc-400 text-xs gap-1 mt-0.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </div>
      );
    }
    if (saveStatus === "unsaved") {
      return (
        <div className="flex items-center text-[#8e8e8e] dark:text-zinc-400 text-xs gap-1 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Unsaved changes</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-[#8e8e8e] dark:text-zinc-400 text-xs gap-1 mt-0.5">
        <Check className="w-3 h-3 text-green-500" />
        <span>All changes saved {lastSavedAt ? `• ${timeText}` : ""}</span>
      </div>
    );
  };

  return (
    <header className="w-full h-14 bg-white/90 dark:bg-[#0f0f12]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] z-20 flex items-center justify-between px-4 sm:px-8 shrink-0 transition-colors">
      {/* Left: Back button + Document Name + Save status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <input
            type="text"
            value={resumeName}
            onChange={(e) => onResumeNameChange?.(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[#1a1a1a] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 rounded px-1.5 py-0.5 w-48 sm:w-64 font-['Outfit'] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            placeholder="Resume Name"
          />
          <div className="px-1.5">{renderSaveStatus()}</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          type="button"
          onClick={onToggleAiAssistant}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            showAiAssistant
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/40"
          }`}
          title="Open AI Resume Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={onToggleAtsDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/60"
        >
          <span>ATS Score</span>
          <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {atsScore}
          </span>
        </button>

        {onSyncCareerProfile && (
          <button
            type="button"
            onClick={onSyncCareerProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800/60 cursor-pointer"
            title="Sync profile details from your Master Career Baseline (CareerOps)"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Career Profile</span>
          </button>
        )}

        <ThemeToggle />

        <button
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2 border border-black/[0.06] dark:border-white/[0.1] bg-white dark:bg-zinc-900 rounded-xl text-sm font-medium text-[#1a1a1a] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={rendering}
          className="flex items-center gap-2 bg-[#9fff00] text-black font-medium rounded-xl px-4 py-2 text-sm hover:bg-[#8fee00] transition-colors disabled:opacity-75"
        >
          {rendering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{rendering ? "Generating PDF..." : "Download PDF"}</span>
        </button>
      </div>
    </header>
  );
};

export default EditorTopBar;
