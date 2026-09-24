import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Palette,
  LayoutTemplate,
  Sparkles,
  X,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Trophy,
  HeartHandshake,
  BookOpen,
  Globe,
  Music,
} from "lucide-react";

const SECTION_TYPES = [
  {
    type: "summary",
    name: "Professional Summary",
    desc: "A brief overview of your background",
    icon: FileText,
  },
  {
    type: "work",
    name: "Work Experience",
    desc: "Your previous roles and achievements",
    icon: Briefcase,
  },
  {
    type: "education",
    name: "Education",
    desc: "Degrees and academic achievements",
    icon: GraduationCap,
  },
  {
    type: "skills",
    name: "Skills",
    desc: "Technical and soft skills",
    icon: Wrench,
  },
  {
    type: "projects",
    name: "Projects",
    desc: "Notable projects you have built",
    icon: FolderOpen,
  },
  {
    type: "awards",
    name: "Awards",
    desc: "Honors and recognition",
    icon: Trophy,
  },
  {
    type: "volunteer",
    name: "Volunteer Work",
    desc: "Community service experience",
    icon: HeartHandshake,
  },
  {
    type: "publications",
    name: "Publications",
    desc: "Articles or books you wrote",
    icon: BookOpen,
  },
  {
    type: "languages",
    name: "Languages",
    desc: "Languages you can speak",
    icon: Globe,
  },
  {
    type: "interests",
    name: "Interests",
    desc: "Hobbies and personal interests",
    icon: Music,
  },
];

const FONTS = [
  { id: "Inter", name: "Inter" },
  { id: "Roboto", name: "Roboto" },
  { id: "Merriweather", name: "Merriweather" },
  { id: "Calibri", name: "Calibri" },
  { id: "Georgia", name: "Georgia" },
];

const COLORS = [
  { id: "#4f46e5", name: "Indigo" },
  { id: "#059669", name: "Emerald" },
  { id: "#e11d48", name: "Rose" },
  { id: "#d97706", name: "Amber" },
  { id: "#0284c7", name: "Sky" },
  { id: "#7c3aed", name: "Purple" },
  { id: "#3f3f46", name: "Zinc" },
  { id: "#000000", name: "Black" },
];

export default function EditorSidebar({
  activeTab,
  onTabChange,
  blocks = [],
  onAddBlock,
  onRemoveBlock,
  templates = [],
  selectedTemplateId,
  onTemplateSelect,
  activeFont,
  onFontChange,
  activeThemeColor,
  onThemeColorChange,
  zoomLevel,
  onZoomChange,
  showAiAssistant = false,
  onToggleAiAssistant,
}) {
  const tabs = [
    { id: "sections", icon: LayoutGrid, label: "Sections" },
    { id: "design", icon: Palette, label: "Design" },
    { id: "templates", icon: LayoutTemplate, label: "Templates" },
    { id: "ai", icon: Sparkles, label: "AI Assistant" },
  ];

  const hasSection = (type) => blocks.some((b) => b.type === type);

  return (
    <div className="flex h-full relative z-10">
      {/* Icon Rail */}
      <div className="w-14 h-full bg-white dark:bg-[#0f0f12] border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center py-4 gap-4 z-20 relative transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === "ai" ? showAiAssistant : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              aria-label={tab.label}
              onClick={() => {
                if (tab.id === "ai") {
                  onToggleAiAssistant?.();
                } else {
                  onTabChange(isActive ? null : tab.id);
                }
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-[#9fff00]/15 dark:bg-[#9fff00]/25 text-[#1a1a1a] dark:text-[#9fff00] ring-1 ring-[#9fff00]/40"
                  : "text-[#8e8e8e] dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1a1a1a] dark:hover:text-zinc-100"
              }`}
              title={tab.label}
            >
              <Icon
                size={20}
                className={isActive ? "text-[#1a1a1a] dark:text-[#9fff00]" : ""}
              />
            </button>
          );
        })}
      </div>

      {/* Flyout Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-72 h-full bg-white dark:bg-[#141417] border-r border-black/[0.06] dark:border-white/[0.08] shadow-xl dark:shadow-2xl absolute left-14 top-0 z-10 flex flex-col transition-colors"
          >
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08]">
              <h2 className="font-outfit font-semibold text-[#1a1a1a] dark:text-zinc-100 text-lg capitalize">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => onTabChange(null)}
                className="text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 p-1 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {/* SECTIONS */}
              {activeTab === "sections" && (
                <div className="flex flex-col gap-3">
                  {SECTION_TYPES.map((section) => {
                    const SIcon = section.icon;
                    const exists = hasSection(section.type);
                    return (
                      <button
                        key={section.type}
                        onClick={() => !exists && onAddBlock(section.type)}
                        disabled={exists}
                        className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all ${
                          exists
                            ? "opacity-50 cursor-not-allowed border-transparent bg-black/[0.02] dark:bg-white/[0.02]"
                            : "border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.18] hover:shadow-sm bg-white dark:bg-zinc-900 cursor-pointer"
                        }`}
                      >
                        <div className="mt-0.5 text-[#1a1a1a] dark:text-zinc-100 bg-black/[0.04] dark:bg-white/[0.06] p-2 rounded-lg">
                          <SIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a] dark:text-zinc-100">
                            {section.name}
                          </p>
                          <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
                            {section.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* DESIGN */}
              {activeTab === "design" && (
                <div className="flex flex-col gap-8">
                  {/* Font */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-zinc-100 mb-3">
                      Font Family
                    </h3>
                    <div className="flex flex-col gap-2">
                      {FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => onFontChange(font.id)}
                          style={{ fontFamily: font.id }}
                          className={`p-3 rounded-lg border text-left text-sm transition-all ${
                            activeFont === font.id
                              ? "border-[#9fff00] ring-1 ring-[#9fff00] bg-[#9fff00]/5 dark:bg-[#9fff00]/10 text-[#1a1a1a] dark:text-zinc-100"
                              : "border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.18] bg-white dark:bg-zinc-900 text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100"
                          }`}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-zinc-100 mb-3">
                      Theme Color
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => onThemeColorChange(color.id)}
                          className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${
                            activeThemeColor === color.id
                              ? "ring-2 ring-offset-2 ring-black/[0.2] dark:ring-white/[0.4] dark:ring-offset-zinc-900"
                              : ""
                          }`}
                          style={{ backgroundColor: color.id }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Zoom */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-zinc-100">
                        Zoom
                      </h3>
                      <span className="text-xs font-medium text-[#8e8e8e] dark:text-zinc-400">
                        {Math.round((zoomLevel || 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={zoomLevel || 1}
                      onChange={(e) =>
                        onZoomChange && onZoomChange(parseFloat(e.target.value))
                      }
                      className="w-full accent-[#9fff00]"
                    />
                  </div>
                </div>
              )}

              {/* TEMPLATES */}
              {activeTab === "templates" && (
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((tmpl) => {
                    const id = tmpl._id || tmpl.id;
                    return (
                      <button
                        key={id}
                        onClick={() => onTemplateSelect(id)}
                        className={`flex flex-col text-left p-2 rounded-xl border transition-all ${
                          selectedTemplateId === id
                            ? "border-[#9fff00] ring-2 ring-[#9fff00] bg-[#9fff00]/5 dark:bg-[#9fff00]/10"
                            : "border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.18] bg-white dark:bg-zinc-900 hover:shadow-sm"
                        }`}
                      >
                        <div className="w-full aspect-[1/1.4] bg-white rounded-md mb-2 flex flex-col overflow-hidden border border-black/[0.04] dark:border-white/[0.06]">
                          {/* Fake template preview */}
                          <div className="h-4 bg-black/[0.04] w-full" />
                          <div className="flex-1 flex p-1 gap-1">
                            <div className="w-1/3 bg-black/[0.03] rounded-sm" />
                            <div className="w-2/3 flex flex-col gap-1">
                              <div className="h-1.5 w-full bg-black/[0.06] rounded-sm" />
                              <div className="h-1.5 w-3/4 bg-black/[0.06] rounded-sm" />
                              <div className="h-1.5 w-5/6 bg-black/[0.06] rounded-sm" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#1a1a1a] dark:text-zinc-100 truncate w-full">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] text-[#8e8e8e] dark:text-zinc-400 truncate w-full">
                          {tmpl.category}
                        </span>
                      </button>
                    );
                  })}
                  {templates.length === 0 && (
                    <div className="col-span-2 text-center text-sm text-[#8e8e8e] dark:text-zinc-400 py-8">
                      No templates available
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
