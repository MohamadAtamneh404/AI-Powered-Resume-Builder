import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ArrowUpRight,
  Trash2,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import { calculateAtsScore } from "../../Utility/atsScoreEngine";

const ResumeCard = ({ resume, onDelete }) => {
  if (!resume) return null;

  const resumeId = resume.id || resume._id;
  const atsResult = calculateAtsScore(resume);
  const atsScore = resume.atsScore ?? atsResult.score;
  const isAtsReady = atsScore >= 80;

  const skillsCount =
    (resume.resumeData?.skills || resume.skills || []).length ||
    atsResult.breakdown?.skillCount ||
    0;

  return (
    <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] uppercase font-mono px-2.5 py-1 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 text-[#1a1a1a] dark:text-zinc-200 font-medium">
            {resume.templateId || "ATS Single-Column"}
          </span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              isAtsReady
                ? "bg-[#9fff00]/20 text-[#1a1a1a] dark:text-[#9fff00] border-[#9fff00]"
                : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAtsReady ? "bg-[#1a1a1a] dark:bg-[#9fff00]" : "bg-amber-600"
              }`}
            ></span>
            <span>{atsScore}% ATS Ready</span>
          </span>
        </div>

        {/* Title & Metadata */}
        <h3 className="font-['Outfit'] text-lg font-bold text-[#1a1a1a] dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
          {resume.title || "Senior Full Stack Engineer Resume"}
        </h3>
        <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-1 font-sans">
          Updated{" "}
          {resume.updatedAt
            ? new Date(resume.updatedAt).toLocaleDateString()
            : "Just now"}
        </p>

        {/* Keyword Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 text-[#1a1a1a] dark:text-zinc-200">
            {skillsCount > 0 ? `${skillsCount} Key Skills` : "ATS Optimized"}
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 text-[#1a1a1a] dark:text-zinc-200">
            Single-Column
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          to={`/create-resume?id=${resumeId}`}
          className="text-xs font-semibold text-white dark:text-black bg-[#1a1a1a] dark:bg-[#9fff00] hover:bg-black dark:hover:bg-[#8fee00] px-4 py-2 rounded-full transition shadow-xs flex items-center gap-1.5"
        >
          <Edit3 size={13} />
          <span>Edit</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to={`/create-resume?id=${resumeId}&view=preview`}
            className="p-2 text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
            title="Preview"
          >
            <ArrowUpRight size={16} />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(resumeId)}
              className="p-2 text-rose-400 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
              title="Delete Resume"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
