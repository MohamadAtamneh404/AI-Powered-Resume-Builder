import React from "react";

const companies = [
  "Google",
  "Meta",
  "Amazon",
  "Microsoft",
  "Apple",
  "Netflix",
  "Stripe",
  "Linear",
];

export default function TrustedBy() {
  return (
    <div className="py-12 border-y border-black/[0.06] bg-[#EDEEF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <p className="text-xs font-semibold tracking-widest text-[#8e8e8e] uppercase mb-8 font-mono">
          Trusted by candidates interviewed at top engineering and product teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 sm:gap-x-16 gap-y-6">
          {companies.map((company) => (
            <span
              key={company}
              className="font-['Outfit'] text-lg sm:text-xl font-bold text-[#1a1a1a]/40 hover:text-[#1a1a1a] tracking-tight transition-colors duration-200 cursor-default"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
