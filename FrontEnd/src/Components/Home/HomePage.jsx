import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import TrustedBy from "./TrustedBy";
import Features from "./Features";
import CircularGallery from "./CircularGallery";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black font-sans text-zinc-900">
      {/* 3. Fixed glassmorphic Navbar */}
      <Navbar />

      {/* Main container */}
      <main>
        {/* 4. Aesthetic Hero Component with CloudFront background video and architectural anchors */}
        <Hero />

        {/* Monochromatic Social Proof */}
        <TrustedBy />

        {/* Feature Highlights with Architectural Bento Cards */}
        <Features />

        {/* Interactive Templates Gallery Section */}
        <section
          id="templates"
          className="py-20 px-6 md:px-12 max-w-7xl mx-auto"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8e8e8e] block mb-2 font-mono">
              // Templates Gallery
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
              Single-Column. Human-Polished.
            </h2>
            <p className="text-sm text-[#8e8e8e] mt-3">
              Explore verified ATS templates designed to pass automated filters
              and impress recruiters.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 sm:p-8 shadow-sm overflow-hidden w-full h-[520px] sm:h-[620px] relative">
            <CircularGallery textColor="#1a1a1a" />
          </div>
        </section>

        {/* Final Architectural Call to Action */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <div className="bg-white rounded-3xl border border-black/[0.06] p-10 sm:p-16 shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8e8e8e] block mb-4 font-mono">
              // Instant Calibration
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-6">
              Ready to elevate your <br className="hidden sm:inline" />
              <span className="text-[#8e8e8e]">career trajectory?</span>
            </h2>
            <p className="text-sm sm:text-base text-[#8e8e8e] max-w-xl mx-auto mb-8">
              Join thousands of job seekers who landed interviews with automated
              ATS audits and real-time AI bullet enhancements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/create-resume")}
                className="w-full sm:w-auto bg-[#9fff00] hover:bg-[#8ee600] text-[#1a1a1a] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.03] shadow-sm flex items-center justify-center gap-2"
              >
                <span>Create My Resume Now</span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate("/examples")}
                className="w-full sm:w-auto bg-transparent hover:bg-black/[0.04] text-[#1a1a1a] border border-black/[0.15] font-medium text-sm sm:text-base px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Browse All Examples
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Architectural Edge Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-black/[0.06] bg-[#EDEEF5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#8e8e8e]">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-bold text-[#1a1a1a] text-sm lowercase">
              mėntality
              <span className="text-[#8e8e8e] font-normal"> · resu.ai</span>
            </span>
            <span>—</span>
            <span>architectural editorial intelligence</span>
          </div>
          <div className="flex items-center gap-6 lowercase">
            <a
              href="#service"
              className="hover:text-[#1a1a1a] transition-colors"
            >
              service
            </a>
            <a
              href="#resources"
              className="hover:text-[#1a1a1a] transition-colors"
            >
              patient resources
            </a>
            <a href="#about" className="hover:text-[#1a1a1a] transition-colors">
              about us
            </a>
            <a
              href="#education"
              className="hover:text-[#1a1a1a] transition-colors"
            >
              education center
            </a>
          </div>
          <div className="text-right font-mono">
            <span>2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
