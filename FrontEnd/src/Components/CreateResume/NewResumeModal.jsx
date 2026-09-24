import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  FileText,
  Bot,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";

export default function NewResumeModal({
  isOpen = false,
  onClose,
  careerProfile = null,
  onSelectCareerProfile,
  onUploadParsed,
  onStartAiCopilot,
  onStartBlank,
}) {
  const [activeMode, setActiveMode] = useState("choose"); // 'choose' | 'upload' | 'scratch-menu'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const hasCareerData = Boolean(
    careerProfile?.targetRole ||
    (Array.isArray(careerProfile?.skills) && careerProfile.skills.length > 0) ||
    (Array.isArray(careerProfile?.experiences) &&
      careerProfile.experiences.length > 0),
  );

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("resumeFile", file);

    try {
      const res = await api.post("/ai/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.profile) {
        onUploadParsed?.(res.data.profile);
        onClose?.();
      } else {
        throw new Error("No structured data returned from parser.");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setUploadError(
        err.response?.data?.message ||
          err.message ||
          "Failed to parse document. Try another file or paste text.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-[#EDEEF5]/40 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9fff00]/10 text-[#9fff00] dark:text-[#9fff00]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1a1a] dark:text-zinc-100">
                Create New ATS Resume
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose how to initialize your resume canvas.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeMode === "choose" && (
            <div className="space-y-3">
              {/* Option 1: Master Career Profile (CareerOps) */}
              <div
                onClick={() => {
                  onSelectCareerProfile?.();
                  onClose?.();
                }}
                className="group p-5 rounded-2xl border border-[#9fff00]/40 hover:border-[#9fff00] bg-[#1a1a1a]/5 dark:bg-[#9fff00]/10 hover:shadow-lg hover:shadow-[#9fff00]/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] dark:bg-[#9fff00] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 group-hover:text-[#9fff00] dark:group-hover:text-[#9fff00] transition">
                          Use Master Career Profile
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9fff00]/20 text-[#1a1a1a] dark:text-[#9fff00] border border-[#9fff00]/50 font-mono">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Instantly populates your resume from your saved
                        CareerOps baseline with 0 manual typing.
                      </p>
                      {hasCareerData ? (
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                          <span className="font-semibold text-[#9fff00] dark:text-[#9fff00]">
                            {careerProfile.targetRole || "Career Role"}
                          </span>
                          <span>•</span>
                          <span>
                            {careerProfile.skills?.length || 0} skills
                          </span>
                          <span>•</span>
                          <span>
                            {careerProfile.experiences?.length || 0} work roles
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Note: Your profile has standard defaults. You can tune
                          it in Settings.
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-zinc-400 group-hover:text-[#9fff00] dark:group-hover:text-[#9fff00] group-hover:translate-x-0.5 transition shrink-0 mt-2"
                  />
                </div>
              </div>

              {/* Option 2: Start from Scratch */}
              <div
                onClick={() => setActiveMode("scratch-menu")}
                className="group p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-zinc-800/50 hover:bg-black/[0.02] dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition">
                        Start from Scratch
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Upload an existing resume to scrape, let the AI Co-pilot
                        interview you, or start with a clean blank canvas.
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition shrink-0 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {activeMode === "scratch-menu" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select Starting Method
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMode("choose")}
                  className="text-xs text-[#9fff00] dark:text-[#9fff00] font-semibold hover:underline cursor-pointer"
                >
                  ← Back to choices
                </button>
              </div>

              {/* Sub-choice A: Upload Existing Resume */}
              <div
                onClick={() => setActiveMode("upload")}
                className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] hover:border-[#9fff00]/50 hover:bg-[#9fff00]/[0.03] dark:hover:bg-[#9fff00]/10 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#9fff00]/10 text-[#9fff00] dark:text-[#9fff00] flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                      Upload & Scrape Existing Resume
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Extracts structured sections from PDF, DOCX, TXT, or JSON.
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </div>

              {/* Sub-choice B: Build with AI Co-Pilot */}
              <div
                onClick={() => {
                  onStartAiCopilot?.();
                  onClose?.();
                }}
                className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] hover:border-[#9fff00]/50 hover:bg-[#9fff00]/[0.03] dark:hover:bg-[#9fff00]/10 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                      Build with AI Co-Pilot
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Guided step-by-step interview with real-time action
                      proposal cards.
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </div>

              {/* Sub-choice C: Blank Canvas */}
              <div
                onClick={() => {
                  onStartBlank?.();
                  onClose?.();
                }}
                className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] hover:border-black/20 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-zinc-800 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-zinc-100">
                      Blank ATS Canvas
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Clean single-column ATS template with empty sections.
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </div>
            </div>
          )}

          {activeMode === "upload" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Upload Resume File
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMode("scratch-menu")}
                  className="text-xs text-[#9fff00] dark:text-[#9fff00] font-semibold hover:underline cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.json,.md"
                className="hidden"
              />

              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  uploading
                    ? "border-[#9fff00] bg-[#9fff00]/5 cursor-wait"
                    : "border-black/15 dark:border-white/15 hover:border-[#9fff00] bg-[#EDEEF5]/30 dark:bg-zinc-800/30"
                }`}
              >
                {uploading ? (
                  <div className="space-y-3">
                    <Loader2
                      size={32}
                      className="animate-spin text-[#9fff00] mx-auto"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        Analyzing and parsing document with AI...
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Structuring contact, experience bullets, and skills
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#9fff00]/10 text-[#9fff00] dark:text-[#9fff00] flex items-center justify-center mx-auto">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        Click to select PDF, TXT, or JSON file
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Files up to 10MB supported
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
                  ⚠️ {uploadError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
