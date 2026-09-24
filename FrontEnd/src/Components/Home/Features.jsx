import React from "react";
import {
  ShieldCheck,
  Sparkles,
  BrainCircuit,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const bentoCards = [
  {
    colSpan: "md:col-span-8",
    tag: "ATS Parsing Engine",
    title: "100% Parser-Compliant Single Column Syntax",
    description:
      "Enterprise ATS screeners (Workday, Greenhouse, Taleo) choke on complex tables, multi-column grids, and floating text boxes. Our layouts are strictly engineered to parse with zero data loss.",
    metric: "99.4%",
    metricLabel: "First-Pass Parse Guarantee",
    icon: (
      <ShieldCheck
        className="text-[#1a1a1a] dark:text-zinc-100 group-hover:text-black"
        size={28}
      />
    ),
    accent: "bg-[#9fff00]",
  },
  {
    colSpan: "md:col-span-4",
    tag: "AI Optimization",
    title: "Quantified Bullet Rewriter",
    description:
      "Instantly transforms passive duties into high-impact outcome bullets with strong action verbs and verified metrics.",
    metric: "3.2x",
    metricLabel: "More Recruiter Callbacks",
    icon: (
      <Sparkles
        className="text-[#1a1a1a] dark:text-zinc-100 group-hover:text-black"
        size={28}
      />
    ),
    accent: "bg-white",
  },
  {
    colSpan: "md:col-span-4",
    tag: "Precision Tailoring",
    title: "Keyword Gap Scanner",
    description:
      "Paste any target job description to automatically extract missing technical skills and experience keywords in seconds.",
    metric: "12+",
    metricLabel: "Keywords Detected / Scan",
    icon: (
      <BrainCircuit
        className="text-[#1a1a1a] dark:text-zinc-100 group-hover:text-black"
        size={28}
      />
    ),
    accent: "bg-white",
  },
  {
    colSpan: "md:col-span-8",
    tag: "Export Vector Quality",
    title: "Pixel-Accurate PDF Vectors",
    description:
      "Engineered directly with precision text vector glyphs so human hiring managers see razor-sharp typography while scrapers read clean semantic ASCII.",
    metric: "0.1s",
    metricLabel: "Instant Client-Side Render",
    icon: (
      <FileCheck2
        className="text-[#1a1a1a] dark:text-zinc-100 group-hover:text-black"
        size={28}
      />
    ),
    accent: "bg-[#9fff00]",
  },
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8e8e8e] dark:text-zinc-400 block mb-3 font-mono">
            // Architecture & Compliance
          </span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a] dark:text-zinc-100 leading-tight">
            Engineered for{" "}
            <span className="text-[#8e8e8e] dark:text-zinc-400">
              100% ATS Pass Rate
            </span>
            .
          </h2>
        </div>
        <p className="text-sm md:text-base text-[#8e8e8e] dark:text-zinc-400 max-w-md font-sans leading-relaxed">
          Never lose an opportunity to bad formatting. ResuAI balances machine
          readability with modern, magazine-grade visual design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {bentoCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.colSpan} bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Top row */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1a1a1a] dark:text-zinc-200 bg-[#EDEEF5] dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {card.tag}
                </span>
                <div className="w-10 h-10 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center group-hover:bg-[#9fff00] dark:group-hover:bg-[#9fff00] transition-colors duration-300">
                  {card.icon}
                </div>
              </div>

              <h3 className="font-['Outfit'] text-xl sm:text-2xl font-semibold text-[#1a1a1a] dark:text-zinc-100 mb-3 group-hover:text-black dark:group-hover:text-[#9fff00] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-[#8e8e8e] dark:text-zinc-400 font-sans leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Bottom metric bar */}
            <div className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.08] flex items-baseline justify-between">
              <div>
                <span className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-zinc-100 block">
                  {card.metric}
                </span>
                <span className="text-xs text-[#8e8e8e] dark:text-zinc-400 font-medium">
                  {card.metricLabel}
                </span>
              </div>
              <button
                onClick={() => navigate("/create-resume")}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-semibold text-[#1a1a1a] dark:text-[#9fff00] flex items-center gap-1 cursor-pointer"
              >
                <span>Try it</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
