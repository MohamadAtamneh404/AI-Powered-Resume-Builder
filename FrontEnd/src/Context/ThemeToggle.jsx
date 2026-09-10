import React from "react";
import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle is a button component that allows users to switch
 * between light and dark themes. It displays a Moon icon in light mode
 * and a Sun icon in dark mode.
 */
const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
        theme === "dark"
          ? "bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-white/[0.1] shadow-xs"
          : "bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-black/[0.08] shadow-xs"
      } ${className}`.trim()}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
};

export default ThemeToggle;
