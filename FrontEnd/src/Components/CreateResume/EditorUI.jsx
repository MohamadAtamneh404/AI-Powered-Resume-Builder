import React, { useMemo, useState, useRef, useEffect } from "react";
import api from "../../services/api";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bot,
  User as UserIcon,
  Wand2,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";


export function SectionCard({
  title,
  action,
  footer,
  as: Tag = "section",
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  children,
}) {
  return (
    <Tag
      className={[
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl",
        className,
      ].join(" ")}
    >
      {(title || action) && (
        <div
          className={[
            "px-5 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white",
            headerClassName,
          ].join(" ")}
        >
          <h3 className="text-sm font-semibold text-[#1a1a1a]">{title}</h3>
          {action ? (
            <div className="text-xs text-purple-300 hover:text-purple-200">
              {action}
            </div>
          ) : null}
        </div>
      )}
      <div className={["p-4", bodyClassName].join(" ")}>{children}</div>
      {footer ? (
        <div
          className={[
            "px-5 py-3 border-t border-black/[0.05] text-xs text-[#8e8e8e] font-sans bg-white",
            footerClassName,
          ].join(" ")}
        >
          {footer}
        </div>
      ) : null}
    </Tag>
  );
}

export function AtsScoreBadge({ score = 96, isOptimized = true }) {
  return (
    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>ATS Score: {score}/100</span>
      <span className="text-emerald-400 font-normal">
        ({isOptimized ? "ATS Optimized" : "Review Needed"})
      </span>
    </div>
  );
}

export function AiSuggestionPopover({
  title = "ATS Keyword Optimizer",
  suggestion = "",
  onApply,
  onDiscard,
  isOpen = false,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-black/[0.08] rounded-2xl shadow-xl z-30 overflow-hidden text-left">
      <div className="bg-purple-900/40 px-3.5 py-2.5 border-b border-purple-500/20 flex justify-between items-center">
        <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
          <span>✨</span> {title}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#1a1a1a] text-xs"
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-3.5 text-xs text-gray-200">
        <p className="leading-relaxed mb-3.5 text-gray-300">{suggestion}</p>
        <div className="flex justify-end gap-2">
          {onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              className="px-3 py-1.5 rounded-full border border-black/[0.1] text-[#1a1a1a] hover:bg-black/[0.04] text-xs transition"
            >
              Discard
            </button>
          )}
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-[#1a1a1a] font-medium text-xs shadow transition"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BlockToolbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  upDisabled,
  downDisabled,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={upDisabled}
        className="px-2.5 py-1 rounded-full border border-black/[0.08] bg-[#EDEEF5]/60 hover:bg-[#EDEEF5] text-xs text-[#1a1a1a] disabled:opacity-40"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={downDisabled}
        className="px-2.5 py-1 rounded-full border border-black/[0.08] bg-[#EDEEF5]/60 hover:bg-[#EDEEF5] text-xs text-[#1a1a1a] disabled:opacity-40"
        title="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="px-2.5 py-1 rounded-full border border-black/[0.08] bg-[#EDEEF5]/60 hover:bg-[#EDEEF5] text-xs text-[#1a1a1a]"
        title="Duplicate"
      >
        ⎘
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="px-2.5 py-1 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs text-rose-700"
        title="Delete"
      >
        ✖
      </button>
    </div>
  );
}

export function ResumePreviewPanel({
  title = "Live preview",
  action,
  loading = false,
  error = null,
  previewHtml = "",
  previewComponent = null, // React element preview (e.g., <ResumeRenderer ... />)
  initialScale = 0.95,
  minScale = 0.75,
  maxScale = 1.25,
  step = 0.05,
  panelClassName = "",
  paperClassName = "",
  headerClassName = "",
  bodyClassName = "",
}) {
  const [scale, setScale] = useState(initialScale);
  const presets = useMemo(() => [0.75, 0.9, 1, 1.1, 1.25], []);
  const dec = () => setScale((s) => Math.max(minScale, +(s - step).toFixed(2)));
  const inc = () => setScale((s) => Math.min(maxScale, +(s + step).toFixed(2)));

  return (
    <section
      className={[
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl",
        panelClassName,
      ].join(" ")}
    >
      <div
        className={[
          "px-5 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white",
          headerClassName,
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">{title}</h3>
          {error ? (
            <span className="text-xs text-red-300">Failed to load preview</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-300">
            <button
              type="button"
              onClick={dec}
              className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom out"
            >
              −
            </button>
            <select
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="bg-[#EDEEF5]/60 border border-black/[0.06] rounded px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom level"
            >
              {presets.map((p) => (
                <option key={p} value={p}>
                  {Math.round(p * 100)}%
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={inc}
              className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          {action ? (
            <div className="text-xs text-purple-300 hover:text-purple-200">
              {action}
            </div>
          ) : null}
        </div>
      </div>
      <div className={["p-4", bodyClassName].join(" ")}>
        {loading ? (
          <div className="px-5 py-4 text-gray-400 text-sm">Rendering…</div>
        ) : (
          <div className="w-full">
            <div className="mx-auto" style={{ width: "min(100%, 720px)" }}>
              <div
                className="origin-top mx-auto"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: "100%",
                }}
              >
                <div
                  className={[
                    "bg-white text-gray-900 rounded-lg shadow",
                    "aspect-[1/1.414] w-full",
                    "overflow-y-auto print:overflow-visible print:shadow-none",
                    paperClassName,
                  ].join(" ")}
                >
                  {previewComponent ? (
                    <div className="w-full h-full">{previewComponent}</div>
                  ) : previewHtml ? (
                    <iframe
                      title="Resume Preview"
                      className="w-full h-full"
                      srcDoc={previewHtml}
                      sandbox="allow-scripts allow-same-origin"
                      style={{ border: "0" }}
                    />
                  ) : (
                    <div className="p-6 sm:p-8 text-sm text-gray-600">
                      Start editing blocks to see a preview. This canvas
                      preserves an A4-like aspect ratio.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function AtsCopilotDrawer({
  isOpen = true,
  onClose,
  score = 0,
  keywordScore = 0,
  syntaxScore = 0,
  impactScore = 0,
  matchedKeywords = [],
  missingKeywords = [],
  goodParts = [],
  badParts = [],
  onFixIssue,
  fixingPartId = null,
  onAddKeyword,
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'bad' | 'good'

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="w-full lg:w-80 xl:w-96 h-[calc(100vh-56px)] overflow-y-auto border-l border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141417] p-5 space-y-4 flex flex-col items-center justify-center flex-shrink-0 z-20 shadow-xl transition-colors">
        <span className="w-7 h-7 border-2 border-black/20 dark:border-white/20 border-t-emerald-500 rounded-full animate-spin"></span>
        <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
          Running Deep ATS Audit...
        </span>
        <p className="text-xs text-gray-400 text-center max-w-[200px]">
          Parsing keyword density, action verbs, and layout compliance
        </p>
      </div>
    );
  }

  const scoreColor =
    score >= 85
      ? "text-emerald-500 stroke-emerald-500"
      : score >= 70
        ? "text-amber-500 stroke-amber-500"
        : "text-rose-500 stroke-rose-500";

  const scoreBgBadge =
    score >= 85
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : score >= 70
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";

  const scoreLabel =
    score >= 85
      ? "Top 2% ATS Ready"
      : score >= 70
        ? "Good • Room for Improvement"
        : "At Risk of Filter Rejection";

  return (
    <div className="w-full lg:w-80 xl:w-96 h-[calc(100vh-56px)] overflow-y-auto border-l border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141417] p-4 space-y-4 text-left flex-shrink-0 z-20 shadow-xl transition-colors custom-scrollbar">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 tracking-tight">
            ATS Diagnostic Telemetry
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 text-xs p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Overall Score Dial Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-white/10 text-center shadow-lg relative overflow-hidden">
        <div className="relative inline-flex items-center justify-center my-1">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="38"
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              className={scoreColor}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray="238"
              strokeDashoffset={238 - (238 * Math.min(100, Math.max(0, score))) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold text-white font-mono">
              {score}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-semibold">
              ATS Score
            </span>
          </div>
        </div>

        <div className={`mt-1.5 text-xs font-semibold px-3 py-1 rounded-full border inline-block ${scoreBgBadge}`}>
          {scoreLabel}
        </div>
      </div>

      {/* Filter Tabs: All, Needs Improvement, Strengths */}
      <div className="flex rounded-xl bg-black/[0.04] dark:bg-white/[0.06] p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-white dark:bg-zinc-800 text-[#1a1a1a] dark:text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All ({badParts.length + goodParts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bad")}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "bad"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
          }`}
        >
          <span>Fix</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
            {badParts.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("good")}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "good"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          <span>Passed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-mono">
            {goodParts.length}
          </span>
        </button>
      </div>

      {/* Areas to Improve (Bad Parts) with 1-Click AI Fix */}
      {(activeTab === "all" || activeTab === "bad") && badParts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Critical ATS Deficiencies ({badParts.length})</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {badParts.map((part) => {
              const isFixing = fixingPartId === part.id;
              return (
                <div
                  key={part.id}
                  className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-2 relative group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-rose-950 dark:text-rose-200">
                      {part.title}
                    </div>
                    {part.pointsLost && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold shrink-0">
                        -{part.pointsLost} pts
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                    {part.issue}
                  </p>

                  <div className="text-[11px] bg-white/80 dark:bg-black/40 p-2 rounded-lg text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Advice: </span>
                    {part.suggestion}
                  </div>

                  {onFixIssue && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onFixIssue(part)}
                        disabled={isFixing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[11px] shadow-sm transition-all disabled:opacity-50"
                      >
                        {isFixing ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Fixing with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>{part.actionLabel || "Fix with AI"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths / What's Working (Good Parts) */}
      {(activeTab === "all" || activeTab === "good") && goodParts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>ATS Strengths & Passed Checks ({goodParts.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {goodParts.map((part) => (
              <div
                key={part.id}
                className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>{part.title}</span>
                  </div>
                  {part.points && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                      +{part.points} pts
                    </span>
                  )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  {part.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Job Keywords */}
      {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-zinc-900/80 border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1a1a1a] dark:text-zinc-100">
              Industry Keyword Alignment
            </span>
            <span className="text-[10px] text-purple-500 font-mono font-bold">
              {matchedKeywords.length} Detected
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1 font-mono font-medium"
              >
                <span>✓</span> {kw}
              </span>
            ))}
            {missingKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onAddKeyword && onAddKeyword(kw)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono cursor-pointer transition"
                title="Click to suggest adding to skills"
              >
                <span>+</span> {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AiAssistantDrawer({
  isOpen = false,
  onClose,
  resumeData = null,
  onApplyPatch,
  onSectionGenerate,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 **Hi! I am your AI Resume Copilot.**\n\nI can help you tailor your resume for specific roles, rewrite bullets with quantifiable metrics, add high-demand ATS keywords, or review any section.\n\nChoose a quick suggestion below or ask anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: "✨ Add metrics to work bullets", prompt: "Enrich all my work experience bullets with measurable metrics, percentages, and strong action verbs." },
    { label: "🎯 Tailor for Senior Engineer", prompt: "Tailor my resume summary and key skills for a Senior Software Engineer / Full Stack role." },
    { label: "💼 Elevate Executive Summary", prompt: "Write a high-impact executive professional summary that commands recruiter attention." },
    { label: "⚡ Suggest Top 10 Keywords", prompt: "Suggest the top 10 most in-demand technical keywords and frameworks for my role." },
  ];

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      // Call backend AI route with scope 'chat-assistant'
      const { data } = await api.post("/ai", {
        scope: "chat-assistant",
        message: text,
        history: nextHistory.slice(-6),
        resumeData,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply || "Here are recommendations for your resume.",
          patch: data?.patch || null,
        },
      ]);
    } catch (err) {
      console.error("AI assistant chat error:", err);
      const detail = err?.response?.data?.message || err.message || "";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Sorry, I encountered an issue connecting to the AI service${detail ? `: ${detail}` : ""}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-84 xl:w-96 h-[calc(100vh-56px)] flex flex-col border-l border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-left flex-shrink-0 z-20 shadow-xl transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white dark:bg-[#141417]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100">
              AI Resume Assistant
            </h3>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Online & Context-Aware
            </span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <Bot size={13} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-black/[0.03] dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.06] rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line prose prose-xs dark:prose-invert">
                  {msg.content}
                </div>

                {/* Optional Patch Apply Button */}
                {msg.patch && onApplyPatch && (
                  <div className="mt-3 pt-2.5 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      Ready to apply to canvas:
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyPatch(msg.patch)}
                      className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] shadow transition flex items-center gap-1"
                    >
                      <Wand2 size={11} />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                )}
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shrink-0 mt-0.5">
                  <UserIcon size={13} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-center text-zinc-400 text-xs pl-2">
            <Bot size={14} className="animate-spin text-purple-500" />
            <span>AI Copilot is analyzing and writing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.06] flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSend(qp.prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[11px] font-medium hover:bg-purple-100 transition disabled:opacity-40 shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-white dark:bg-[#141417]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask AI to tailor, rewrite, or optimize..."
            className="flex-1 text-xs px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-40 shadow-sm"
            title="Send"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

