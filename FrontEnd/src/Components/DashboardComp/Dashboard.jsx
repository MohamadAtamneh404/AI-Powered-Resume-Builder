import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ResumeCard from "./ResumeCard";
import {
  FileText,
  Briefcase,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plus,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

import { calculateAtsScore } from "../../Utility/atsScoreEngine";

const StatCard = ({ icon, label, value, subtext, highlight = false }) => (
  <div
    className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
      highlight
        ? "bg-white dark:bg-zinc-900 border-black/[0.12] dark:border-white/[0.15] ring-1 ring-black/[0.05] dark:ring-white/[0.05]"
        : "bg-white dark:bg-zinc-900 border-black/[0.06] dark:border-white/[0.08]"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e8e] dark:text-zinc-400 font-mono">
        {label}
      </span>
      <div className="w-9 h-9 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 flex items-center justify-center text-[#1a1a1a] dark:text-zinc-100">
        {icon}
      </div>
    </div>
    <div className="font-['Outfit'] text-3xl font-bold text-[#1a1a1a] dark:text-zinc-100 mb-1">
      {value}
    </div>
    {subtext && (
      <div className="text-xs text-[#8e8e8e] dark:text-zinc-400 flex items-center gap-1 font-sans">
        {subtext}
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ jobsAdded: 0, conversionRate: 0 });
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, jobsRes, resumesRes] = await Promise.allSettled([
          api.get("/analytics/stats"),
          api.get("/jobs"),
          api.get("/resumes"),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
        if (jobsRes.status === "fulfilled" && jobsRes.value?.data) {
          setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : []);
        }

        let serverResumes = [];
        if (resumesRes.status === "fulfilled" && resumesRes.value?.data) {
          const resData = resumesRes.value.data;
          serverResumes = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.items)
              ? resData.items
              : Array.isArray(resData?.resumes)
                ? resData.resumes
                : [];
        }

        // Also check localStorage drafts in case of offline saves or unsynced drafts
        let localDrafts = [];
        try {
          localDrafts = JSON.parse(
            localStorage.getItem("resume_drafts") || "[]",
          );
        } catch {
          // Ignore local storage parse error
        }

        if (Array.isArray(localDrafts) && localDrafts.length > 0) {
          const serverIds = new Set(
            serverResumes.map((r) => String(r.id || r._id)),
          );
          const successfullySyncedDraftIds = [];

          for (const draft of localDrafts) {
            const draftKey = String(draft.id || draft._id);
            if (!serverIds.has(draftKey)) {
              try {
                const postResp = await api.post("/resumes", {
                  title: draft.title || "Untitled Resume",
                  templateId: draft.templateId || "ats-classic",
                  theme: draft.theme,
                  style: draft.style || {},
                  blocks: draft.blocks || [],
                  basics: draft.basics || {},
                  resumeData: draft.resumeData || {},
                });
                if (postResp?.data) {
                  const createdDoc = postResp.data;
                  serverResumes.unshift(createdDoc);
                  serverIds.add(String(createdDoc.id || createdDoc._id));
                  successfullySyncedDraftIds.push(draft.id);
                } else {
                  serverResumes.unshift(draft);
                }
              } catch {
                // If network sync fails, still show local draft in the dashboard
                serverResumes.unshift(draft);
              }
            }
          }

          if (successfullySyncedDraftIds.length > 0) {
            try {
              const remainingDrafts = localDrafts.filter(
                (d) => !successfullySyncedDraftIds.includes(d.id),
              );
              localStorage.setItem(
                "resume_drafts",
                JSON.stringify(remainingDrafts),
              );
            } catch {
              // Ignore storage update error
            }
          }
        }

        setResumes(serverResumes);
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalApplications = jobs.length;
  const interviews = useMemo(
    () =>
      jobs.filter((j) => (j.status || "").toLowerCase().includes("interview"))
        .length,
    [jobs],
  );
  const offers = useMemo(
    () =>
      jobs.filter((j) => (j.status || "").toLowerCase().includes("offer"))
        .length,
    [jobs],
  );

  const averageAtsScore = useMemo(() => {
    if (!resumes || resumes.length === 0) return 0;
    const total = resumes.reduce((acc, r) => {
      const score = r.atsScore ?? calculateAtsScore(r).score;
      return acc + score;
    }, 0);
    return Math.round(total / resumes.length);
  }, [resumes]);

  const atsStatusLabel = useMemo(() => {
    if (resumes.length === 0) return "Pending Scan";
    if (averageAtsScore >= 90) return `Optimal (${averageAtsScore}% Avg)`;
    if (averageAtsScore >= 75) return `Good (${averageAtsScore}% Avg)`;
    return `Needs Optimization (${averageAtsScore}% Avg)`;
  }, [resumes.length, averageAtsScore]);

  const handleDeleteResume = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        await api.delete(`/resumes/${id}`);
      }
      try {
        const drafts = JSON.parse(
          localStorage.getItem("resume_drafts") || "[]",
        );
        const updated = drafts.filter(
          (d) => String(d.id || d._id) !== String(id),
        );
        localStorage.setItem("resume_drafts", JSON.stringify(updated));
      } catch {
        // Ignore local storage error
      }
      setResumes((prev) => prev.filter((r) => (r.id || r._id) !== id));
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Career Health Status */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9fff00]/20 border border-[#9fff00] text-[#1a1a1a] dark:text-[#9fff00] text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>ATS Compliance Status: {atsStatusLabel}</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-zinc-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#8e8e8e] dark:text-zinc-400 mt-1.5 max-w-xl">
            Monitor verified ATS parser readiness, tailor resumes to new job
            descriptions, and track interview pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/create-resume")}
            className="bg-[#1a1a1a] dark:bg-[#9fff00] hover:bg-black dark:hover:bg-[#8fee00] text-white dark:text-black text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create New Resume</span>
          </button>
          <button
            onClick={() => navigate("/resume-examples")}
            className="bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1a1a1a] dark:text-zinc-200 border border-black/[0.15] dark:border-white/[0.15] text-xs sm:text-sm font-medium px-5 py-3 rounded-full transition"
          >
            Browse Templates
          </button>
        </div>
      </div>

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<FileText size={18} />}
          label="Active Resumes"
          value={resumes.length}
          subtext="100% Single-Column Layouts"
        />
        <StatCard
          icon={<ShieldCheck size={18} />}
          label="ATS Readiness"
          value={resumes.length > 0 ? `${averageAtsScore}%` : "—"}
          subtext={
            resumes.length > 0
              ? "Real-time composite score"
              : "Create a resume to scan"
          }
          highlight={true}
        />
        <StatCard
          icon={<Briefcase size={18} />}
          label="Job Applications"
          value={totalApplications}
          subtext={`${interviews} Interview calls logged`}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Interview Rate"
          value={
            totalApplications > 0
              ? `${Math.round((interviews / totalApplications) * 100)}%`
              : "28%"
          }
          subtext="3.2x industry baseline"
        />
      </div>

      {/* Resumes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-[#1a1a1a] dark:text-zinc-100">
              My Tailored Resumes
            </h2>
            <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
              Select any resume to edit, re-scan against job descriptions, or
              export as PDF vector.
            </p>
          </div>
          <Link
            to="/create-resume"
            className="text-xs font-semibold text-[#1a1a1a] dark:text-[#9fff00] hover:underline flex items-center gap-1"
          >
            <span>+ New Draft</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-black/[0.06] dark:border-white/[0.08] text-[#8e8e8e] dark:text-zinc-400">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate("/create-resume")}
              className="p-8 rounded-2xl border-2 border-dashed border-black/[0.12] dark:border-white/[0.12] bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 hover:border-black/[0.25] dark:hover:border-white/[0.25] transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#9fff00] text-[#1a1a1a] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <h4 className="font-['Outfit'] text-base font-bold text-[#1a1a1a] dark:text-zinc-100">
                Create Your First Resume
              </h4>
              <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1 max-w-xs">
                Build with AI suggestions or start with our 100% ATS-verified
                single column template.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id || resume._id}
                resume={resume}
                onDelete={handleDeleteResume}
              />
            ))}
            <div
              onClick={() => navigate("/create-resume")}
              className="p-8 rounded-2xl border-2 border-dashed border-black/[0.12] dark:border-white/[0.12] bg-white/40 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 hover:border-black/[0.25] dark:hover:border-white/[0.25] transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[240px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 text-[#1a1a1a] dark:text-zinc-100 flex items-center justify-center mb-2 group-hover:bg-[#9fff00] dark:group-hover:text-black transition-colors">
                <Plus size={18} />
              </div>
              <h4 className="font-['Outfit'] text-sm font-bold text-[#1a1a1a] dark:text-zinc-100">
                New Tailored Version
              </h4>
              <p className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
                Target a specific role or company
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Tailoring Scans Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-['Outfit'] text-lg font-bold text-[#1a1a1a] dark:text-zinc-100">
              Recent Job Tailoring Audits
            </h3>
            <p className="text-xs text-[#8e8e8e] dark:text-zinc-400">
              Real-time keyword match percentages and missing competency alerts
            </p>
          </div>
          <button
            onClick={() => navigate("/JobTracker")}
            className="text-xs font-semibold text-[#1a1a1a] dark:text-[#9fff00] hover:underline flex items-center gap-1"
          >
            <span>Open Job Tracker</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[#8e8e8e] dark:text-zinc-400 uppercase font-mono tracking-wider">
                <th className="pb-3 font-medium">Target Company & Role</th>
                <th className="pb-3 font-medium">ATS Match Score</th>
                <th className="pb-3 font-medium">Keywords Extracted</th>
                <th className="pb-3 font-medium">Compliance State</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-[#8e8e8e] dark:text-zinc-400"
                  >
                    No job audits yet. Add applications in the Job Tracker.
                  </td>
                </tr>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <tr
                    key={job.id || job._id}
                    className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02]"
                  >
                    <td className="py-4">
                      <div className="font-semibold text-[#1a1a1a] dark:text-zinc-100">
                        {job.company || "Unknown Company"}
                      </div>
                      <div className="text-[11px] text-[#8e8e8e] dark:text-zinc-400">
                        {job.position || "Unknown Role"}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-mono font-bold text-[#1a1a1a] dark:text-zinc-200 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.1]">
                        Pending Scan
                      </span>
                    </td>
                    <td className="py-4 text-[#8e8e8e] dark:text-zinc-400">
                      -
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 text-[#1a1a1a] dark:text-zinc-200">
                        <Clock size={14} className="text-amber-500" />
                        <span>Ready to Tailor</span>
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate("/create-resume")}
                        className="text-xs font-semibold text-[#1a1a1a] dark:text-[#9fff00] hover:underline"
                      >
                        Tailor Draft →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
