import React from "react";

export default function Logo({
  className = "",
  size = "md",
  iconOnly = false,
}) {
  const sizes = {
    sm: { icon: "w-5 h-5", text: "text-lg" },
    md: { icon: "w-6 h-6", text: "text-xl" },
    lg: { icon: "w-8 h-8", text: "text-2xl" },
    xl: { icon: "w-10 h-10", text: "text-3xl" },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div
      className={`flex items-center gap-2.5 font-['Outfit'] font-bold tracking-tight lowercase ${className}`}
    >
      {/* Geometric Clover / Flower SVG icon */}
      <svg
        className={`${current.icon} fill-[#1a1a1a] transition-transform duration-300 hover:rotate-45 flex-shrink-0`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C9.79 2 8 3.79 8 6c0 1.25.57 2.36 1.46 3.09C8.36 9.57 7.25 9 6 9c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.25 0 2.36-.57 3.09-1.46C9.57 16.36 9 17.47 9 18.72 9 20.93 10.79 22.72 13 22.72s4-1.79 4-4c0-1.25-.57-2.36-1.46-3.09 1.1-.48 2.21-1.05 3.46-1.05 2.21 0 4-1.79 4-4s-1.79-4-4-4c-1.25 0-2.36.57-3.09 1.46C15.43 8.36 16 7.25 16 6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2zM6 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm7 9.72c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2zm5-7.72c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
      </svg>
      {!iconOnly && (
        <span className={`text-[#1a1a1a] ${current.text}`}>
          resu<span className="text-[#8e8e8e]">·</span>ai
        </span>
      )}
    </div>
  );
}
