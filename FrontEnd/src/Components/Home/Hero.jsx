import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CircularGallery from "./CircularGallery";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate("/create-resume?prompt=" + encodeURIComponent(query.trim()));
    } else {
      navigate("/create-resume");
    }
  };

  return (
    <section className="relative min-h-[110vh] sm:min-h-[140vh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base">
      {/* Background Video Container */}
      <div className="absolute top-[15vh] sm:top-[20vh] left-0 w-full h-[95vh] sm:h-[120vh] z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-100"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
        {/* Gradient Mask to smoothly blend the video into the #EDEEF5 background */}
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-bg-base to-transparent"></div>
      </div>

      {/* Hero Content Alignment */}
      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 lg:px-20 relative z-10 grid grid-cols-12 gap-x-4 md:gap-x-8 pt-32 sm:pt-40 md:pt-44">
        <div className="col-span-12 md:col-span-10 md:col-start-2">
          {/* Hero Header (motion.h1) with slide-up fade */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-['Outfit'] text-3xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.1] sm:leading-[1.08] tracking-[-0.03em] font-normal"
          >
            <span className="text-[#1a1a1a] font-semibold block">
              Remix: Mentality offers
            </span>
            <span className="text-[#8e8e8e]">information</span>
            <br />
            <span className="text-[#8e8e8e]">
              and resources to help you manage
            </span>
            <br />
            <span className="text-[#8e8e8e] inline-flex items-center flex-wrap gap-2 md:gap-3">
              <span>your</span>
              {/* Eye Icon Pupil UI Element */}
              <span className="w-[32px] sm:w-[42px] lg:w-[62px] h-[22px] sm:h-[28px] lg:h-[36px] border-[2px] border-[#1a1a1a] rounded-full inline-flex items-center justify-center bg-transparent my-auto">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1a1a1a] rounded-full block"></span>
              </span>
              <span>mental wellbeing & career.</span>
            </span>
          </motion.h1>

          {/* Search Pill Component with delayed slide-up animation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 sm:mt-12 max-w-xl"
          >
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-[6px] border border-black/[0.05] p-1 pl-4 flex items-center shadow-sm hover:border-black/[0.15] transition-all duration-200">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything... (e.g. optimize resume for Senior Engineer)"
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1.5 pr-2"
                />
                <button
                  type="submit"
                  className="bg-[#1a1a1a] hover:bg-black text-white w-9 h-9 min-w-[36px] rounded-full relative flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label="Submit search"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-[#8e8e8e] font-medium">
                Quick:
              </span>
              {[
                "ATS Score Scan",
                "Bullet Improver",
                "Software Engineer",
                "Product Manager",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="text-xs text-[#1a1a1a] bg-white/70 hover:bg-white px-2.5 py-1 rounded-full border border-black/[0.05] transition-all hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>


        </div>
      </div>

      {/* Architectural Edge Anchors */}
      {/* Absolute middle right edge: glassmorphic pill button for language switching (pl — en) */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <button
          onClick={() => setLang(lang === "en" ? "pl" : "en")}
          className="bg-white/70 hover:bg-white/90 backdrop-blur-md border border-black/[0.08] px-3.5 py-1.5 rounded-full shadow-sm text-xs font-medium text-[#1a1a1a] tracking-wider transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
        >
          <span
            className={
              lang === "pl" ? "font-bold text-black" : "text-[#8e8e8e]"
            }
          >
            pl
          </span>
          <span className="text-[#8e8e8e] text-[10px]">—</span>
          <span
            className={
              lang === "en" ? "font-bold text-black" : "text-[#8e8e8e]"
            }
          >
            en
          </span>
        </button>
      </div>

      {/* Absolute bottom left corner: '2024' */}
      <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 z-20 pointer-events-none">
        <span className="text-xs text-[#8e8e8e] tracking-widest font-mono select-none">
          2024
        </span>
      </div>

      {/* Absolute bottom right corner: 'mental health tools' / 'ai resume architect' */}
      <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-12 z-20 pointer-events-none">
        <span className="text-xs text-[#8e8e8e] tracking-wider lowercase select-none">
          mental health tools · ai resume architect
        </span>
      </div>
    </section>
  );
}
