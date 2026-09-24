import React, { useState } from "react";
import api from "../../services/api";

const ENTRY_PATHWAYS = [
  {
    id: "ai",
    title: "Build with AI Copilot",
    badge: "Recommended",
    desc: "Interactive prompt-driven generation calibrated for high-impact metric bullets and 98%+ ATS match.",
    icon: "✨",
  },
  {
    id: "import",
    title: "Import Existing Resume",
    badge: "PDF / DOCX",
    desc: "Parse and clean up your old resume, automatically eliminating parser-breaking tables and columns.",
    icon: "📥",
  },
  {
    id: "blank",
    title: "Start from Blank ATS Canvas",
    badge: "Standard",
    desc: "Raw field-by-field editor loaded with a pre-validated, single-column semantic template.",
    icon: "📝",
  },
];

const SUGGESTED_ROLES = [
  "Senior Full Stack Engineer",
  "DevOps & Platform SRE",
  "Staff Product Manager",
  "AI / Machine Learning Engineer",
  "Engineering Manager",
  "Data Scientist",
];

const SENIORITY_LEVELS = [
  "Entry / Associate (0-2 yrs)",
  "Mid-Level (3-5 yrs)",
  "Senior (5-8 yrs)",
  "Staff / Principal (8+ yrs)",
  "Director / Executive",
];

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedPathway, setSelectedPathway] = useState("ai");
  const [roleTitle, setRoleTitle] = useState("Senior Full Stack Engineer");
  const [seniority, setSeniority] = useState("Senior (5-8 yrs)");
  const [jobDescription, setJobDescription] = useState("");
  const [extractedKeywords, setExtractedKeywords] = useState([
    "TypeScript",
    "React",
    "Node.js",
    "Docker",
    "REST APIs",
    "System Architecture",
  ]);

  if (!isOpen) return null;

  const handleJdChange = (val) => {
    setJobDescription(val);
    // Simple mock extractor extracting common tech keywords
    const keywords = [];
    const lower = val.toLowerCase();
    const common = [
      "kubernetes",
      "aws",
      "ci/cd",
      "graphql",
      "microservices",
      "python",
      "redis",
      "sql",
      "react",
      "node",
      "typescript",
      "agile",
    ];
    common.forEach((kw) => {
      if (lower.includes(kw)) {
        keywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });
    if (keywords.length > 0) {
      setExtractedKeywords([...new Set([...keywords, "System Architecture"])]);
    }
  };

  const handleFinish = async () => {
    try {
      await api.put("/user/career-profile", {
        targetRole: roleTitle,
        seniority,
        skills: extractedKeywords,
      });
    } catch (e) {
      console.warn("Failed to persist career baseline to database:", e);
    }
    onComplete?.({
      pathway: selectedPathway,
      roleTitle,
      seniority,
      jobDescription,
      extractedKeywords,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Career Baseline Setup (CareerOps)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-white">
              Step {step} of 3:{" "}
              {step === 1
                ? "Select Entry Pathway"
                : step === 2
                  ? "Target Role & Seniority"
                  : "ATS Keyword Calibration"}
            </span>
            <span className="font-mono text-cyan-400">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9fff00] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* STEP 1: Pathways */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  How would you like to start?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your creation mode. All pathways output strict 100%
                  ATS-compliant single-column formatting.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {ENTRY_PATHWAYS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPathway(p.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                      selectedPathway === p.id
                        ? "bg-[#9fff00]/15 border-[#9fff00]/60 shadow-lg shadow-[#9fff00]/10 ring-1 ring-[#9fff00]/30"
                        : "bg-slate-950/60 border-white/10 hover:bg-slate-800/60 hover:border-white/20"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#9fff00]/20 border border-[#9fff00]/30 flex items-center justify-center text-lg flex-shrink-0">
                      {p.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {p.title}
                        </span>
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 flex-shrink-0 ${
                        selectedPathway === p.id
                          ? "border-[#9fff00] bg-[#9fff00] text-black text-[10px]"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedPathway === p.id && "✓"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Role & Seniority */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9fff00]/50"
                />
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-2">
                  Suggested Roles
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleTitle(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        roleTitle === r
                          ? "bg-[#9fff00] text-black border-[#9fff00]"
                          : "bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-800"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Experience Seniority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SENIORITY_LEVELS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeniority(s)}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition ${
                        seniority === s
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200"
                          : "bg-slate-950 border-white/10 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Job Description & Keywords */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Paste Target Job Description (Optional)
                  </label>
                  <span className="text-[11px] text-cyan-400">
                    Live Parser Active
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => handleJdChange(e.target.value)}
                  placeholder="Paste a job post snippet here to extract required keywords and match algorithms..."
                  className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9fff00]/50 font-mono"
                />
              </div>

              {/* Extracted Keywords Chips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    Target ATS Keywords Extracted
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {extractedKeywords.length} Detected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950 border border-white/10 min-h-[50px]">
                  {extractedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5"
                    >
                      <span>✓</span> {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contextual ATS Insight Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-[#9fff00]/30 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>ATS Optimization Rule:</strong> Including at least 5
                  verified target skills in your Experience bullets increases
                  first-round interview invitations by <strong>3.2x</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#9fff00] hover:bg-[#9fff00] text-black shadow-lg shadow-[#9fff00]/20 transition flex items-center gap-1.5"
            >
              <span>Continue</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-[#9fff00] hover:bg-[#8fee00] shadow-lg shadow-[#9fff00]/20 transition flex items-center gap-2"
            >
              <span>⚡ Launch Resume Architect</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
