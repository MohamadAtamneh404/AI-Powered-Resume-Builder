import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;
import {
  Plus,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Heart,
  BookOpen,
  Languages,
  Star,
  CheckCircle2,
} from "lucide-react";

const SECTION_TYPES = [
  { type: "summary", name: "Professional Summary", icon: FileText },
  { type: "work", name: "Work Experience", icon: Briefcase },
  { type: "education", name: "Education", icon: GraduationCap },
  { type: "skills", name: "Skills", icon: Wrench },
  { type: "projects", name: "Projects", icon: FolderKanban },
  { type: "awards", name: "Awards", icon: Award },
  { type: "volunteer", name: "Volunteer Work", icon: Heart },
  { type: "publications", name: "Publications", icon: BookOpen },
  { type: "languages", name: "Languages", icon: Languages },
  { type: "interests", name: "Interests", icon: Star },
];

const AddSectionButton = ({
  onAddBlock,
  existingTypes = [],
  hideExisting = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize existing types to a Set for fast lookup
  const existingSet = useMemo(() => {
    if (!Array.isArray(existingTypes)) return new Set();
    return new Set(
      existingTypes
        .map((item) => (typeof item === "string" ? item : item?.type))
        .filter(Boolean),
    );
  }, [existingTypes]);

  // Filter or list sections based on singleton filtering
  const visibleSections = useMemo(() => {
    if (hideExisting) {
      return SECTION_TYPES.filter((section) => !existingSet.has(section.type));
    }
    return SECTION_TYPES;
  }, [hideExisting, existingSet]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (type) => {
      if (onAddBlock) {
        onAddBlock(type);
      }
      setIsOpen(false);
    },
    [onAddBlock],
  );

  // Close dropdown on click outside or on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative group py-2 my-0.5 flex items-center justify-center transition-all ${className}`}
    >
      {/* Dashed line and centered '+' button container */}
      <div
        className={`w-full flex items-center justify-center transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Left dashed line */}
        <div className="flex-1 border-t border-dashed border-black/[0.12]" />

        {/* '+' circle button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Add Section"
          title="Add Section"
          className={`relative z-10 mx-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border shadow-sm text-[#1a1a1a] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9fff00] ${
            isOpen
              ? "border-[#1a1a1a] bg-zinc-50 scale-105"
              : "border-black/[0.12] hover:border-black/[0.25] hover:scale-110 active:scale-95"
          }`}
        >
          <Plus
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
          />
        </button>

        {/* Right dashed line */}
        <div className="flex-1 border-t border-dashed border-black/[0.12]" />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-1.5 z-50 w-64 bg-white border border-black/[0.06] rounded-xl shadow-lg p-1.5 overflow-hidden font-sans"
            role="menu"
            aria-label="Available Sections"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider select-none border-b border-black/[0.04] mb-1">
              Add Section
            </div>

            {visibleSections.length > 0 ? (
              <div className="max-h-72 overflow-y-auto space-y-0.5">
                {visibleSections.map((section) => {
                  const Icon = section.icon;
                  const isExisting = existingSet.has(section.type);

                  return (
                    <button
                      key={section.type}
                      type="button"
                      role="menuitem"
                      disabled={isExisting}
                      onClick={() => !isExisting && handleSelect(section.type)}
                      className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-left rounded-lg transition-colors text-sm font-medium ${
                        isExisting
                          ? "opacity-40 cursor-not-allowed bg-black/[0.02] text-[#8e8e8e]"
                          : "text-[#1a1a1a] hover:bg-black/[0.04] cursor-pointer group/item"
                      }`}
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-black/[0.04] text-[#1a1a1a] group-hover/item:bg-[#9fff00]/25 transition-colors shrink-0">
                        <Icon size={15} />
                      </div>
                      <span className="truncate flex-1">{section.name}</span>
                      {isExisting && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8e8e8e] px-1.5 py-0.5 bg-black/[0.04] rounded">
                          Added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-5 text-center">
                <CheckCircle2
                  size={22}
                  className="mx-auto text-[#8e8e8e] mb-1.5 opacity-60"
                />
                <p className="text-xs font-medium text-[#1a1a1a]">
                  All sections added
                </p>
                <p className="text-[11px] text-[#8e8e8e] mt-0.5">
                  All available section types are in your resume.
                </p>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddSectionButton;
