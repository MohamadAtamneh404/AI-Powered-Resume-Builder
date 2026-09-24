import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Download,
  Check,
  Loader2,
  Sparkles,
  Briefcase,
  Undo2,
  Redo2,
  ChevronDown,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
import Logo from "../../common/Logo";

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
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [timeText, setTimeText] = useState(timeAgo(lastSavedAt));
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Undo / Redo Controls */}
        <div className="flex items-center gap-0.5 border-l border-black/[0.08] dark:border-white/[0.1] pl-2 ml-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          type="button"
          onClick={onToggleAiAssistant}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            showAiAssistant
              ? "bg-[#9fff00] text-black border-[#9fff00] shadow-sm"
              : "bg-zinc-100 dark:bg-[#9fff00]/10 text-[#1a1a1a] dark:text-[#9fff00] border-[#9fff00]/50 dark:border-[#9fff00]/60 hover:bg-zinc-200 dark:hover:bg-[#9fff00]/10"
          }`}
          title="Open AI Resume Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#9fff00]" />
          <span>AI Assistant</span>
        </button>

        {/* Consolidated Diagnostics & Career Tools Dropdown */}
        <div className="relative" ref={toolsRef}>
          <button
            type="button"
            onClick={() => setIsToolsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-2xs"
            title="Diagnostics & Profile Tools"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Tools</span>
            <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
              {atsScore}%
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isToolsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onToggleAtsDrawer?.();
                  setIsToolsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      ATS Diagnostics
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Parser score & checks
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {atsScore}%
                </span>
              </button>

              {onSyncCareerProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncCareerProfile?.();
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Career Baseline
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Sync Master Profile
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

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
