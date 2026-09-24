import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

// Icon mapping
const iconMap = {
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
  "file-text": FileText,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  award: Award,
};

// Dedicated 100% ATS-Compliant Single-Column Renderer
export const AtsClassicRenderer = ({
  resumeData,
  fontFamily,
  primaryColor,
}) => {
  const p = resumeData?.personalInfo || resumeData?.basics || {};
  const exp = resumeData?.experience || resumeData?.work || [];
  const edu = resumeData?.education || [];
  const skills = resumeData?.skills || [];
  const skillGroups = resumeData?.skillGroups || [];
  const projects = resumeData?.projects || [];
  const awards = resumeData?.awards || [];
  const certs = resumeData?.certifications || [];
  const languages = resumeData?.languages || [];

  const formatLink = (type, val) => {
    if (!val) return "";
    const clean = String(val).trim();
    if (!clean) return "";
    if (type === "linkedin") {
      if (clean.includes("linkedin.com")) {
        return clean.replace(/^https?:\/\/(www\.)?/, "");
      }
      return `linkedin.com/in/${clean}`;
    }
    if (type === "github") {
      if (clean.includes("github.com")) {
        return clean.replace(/^https?:\/\/(www\.)?/, "");
      }
      return `github.com/${clean}`;
    }
    if (type === "website") {
      return clean.replace(/^https?:\/\/(www\.)?/, "");
    }
    return clean;
  };

  const rawItems = [
    p.email,
    p.phone,
    typeof p.location === "string" ? p.location : p.location?.city,
    formatLink("website", p.website || p.url),
    formatLink("linkedin", p.linkedin),
    formatLink("github", p.github),
  ].filter(Boolean);

  const seen = new Set();
  const contactItems = rawItems.filter((item) => {
    const lower = item.toLowerCase().replace(/\/+$/, "");
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  return (
    <div
      className="w-full bg-white text-gray-900 font-sans p-8 sm:p-12 text-left leading-normal"
      style={{
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: fontFamily
          ? `'${fontFamily}', system-ui, sans-serif`
          : undefined,
      }}
    >
      {/* Header */}
      <header className="text-center border-b border-gray-900 pb-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900">
          {p.name || "Your Name"}
        </h1>
        {p.title && (
          <div className="text-sm sm:text-base font-medium text-gray-700 mt-0.5">
            {p.title}
          </div>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-gray-700">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-400">•</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Professional Summary */}
      {p.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {p.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {exp.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-3">
            Work Experience
          </h2>
          <div className="space-y-4">
            {exp.map((item, i) => {
              const bullets = Array.isArray(item.description)
                ? item.description
                : typeof item.description === "string"
                  ? item.description.split("\n").filter(Boolean)
                  : item.highlights || [];

              return (
                <div key={i} className="text-xs sm:text-sm">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <div>
                      <span className="font-bold text-gray-900">
                        {item.title}
                      </span>
                      {item.company && (
                        <span className="italic text-gray-800">
                          {" "}
                          | {item.company}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
                      {item.location ? ` | ${item.location}` : ""}
                    </div>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-gray-800">
                      {bullets.map((b, bi) => (
                        <li key={bi} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills (Categorized Text - 100% ATS Friendly) */}
      {(skillGroups.length > 0 || skills.length > 0) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-2">
            Skills
          </h2>
          <div className="text-xs sm:text-sm text-gray-800 space-y-1">
            {skillGroups.length > 0 ? (
              skillGroups.map((group, gi) => (
                <div key={gi}>
                  <span className="font-bold text-gray-900">
                    {group.name}:{" "}
                  </span>
                  <span>{group.keywords.join(", ")}</span>
                </div>
              ))
            ) : (
              <div>
                <span className="font-bold text-gray-900">
                  Technical Skills:{" "}
                </span>
                <span>{skills.join(", ")}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {edu.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-2.5">
            {edu.map((item, i) => (
              <div key={i} className="text-xs sm:text-sm">
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <div>
                    <span className="font-bold text-gray-900">
                      {item.degree} {item.area ? `in ${item.area}` : ""}
                    </span>
                    {item.institution && (
                      <span className="italic text-gray-800">
                        {" "}
                        | {item.institution}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {item.startDate}{" "}
                    {item.endDate ? `– ${item.endDate}` : item.year || ""}
                  </div>
                </div>
                {item.gpa && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    GPA: {item.gpa}
                  </div>
                )}
                {item.summary && (
                  <p className="text-xs text-gray-700 mt-0.5">{item.summary}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj, pi) => (
              <div key={pi} className="text-xs sm:text-sm">
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <span className="font-bold text-gray-900">{proj.name}</span>
                  {proj.url && (
                    <span className="text-xs text-gray-600">{proj.url}</span>
                  )}
                </div>
                {proj.technologies?.length > 0 && (
                  <div className="text-xs italic text-gray-700">
                    Technologies: {proj.technologies.join(", ")}
                  </div>
                )}
                {proj.description && (
                  <p className="text-xs text-gray-800 mt-1 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Awards */}
      {(certs.length > 0 || awards.length > 0) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-2">
            Certifications & Awards
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-1 text-xs sm:text-sm text-gray-800">
            {certs.map((c, ci) => (
              <li key={`cert-${ci}`}>
                <span className="font-bold">{c.name}</span>
                {c.issuer ? ` – ${c.issuer}` : ""}
                {c.year ? ` (${c.year})` : ""}
              </li>
            ))}
            {awards.map((a, ai) => (
              <li key={`award-${ai}`}>
                <span className="font-bold">{a.title}</span>
                {a.awarder ? ` – ${a.awarder}` : ""}
                {a.date ? ` (${a.date})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 mb-1">
            Languages
          </h2>
          <p className="text-xs sm:text-sm text-gray-800">
            {languages
              .map((l) => `${l.language}${l.fluency ? ` (${l.fluency})` : ""}`)
              .join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
};

// Dynamic Template Renderer
const ResumeRenderer = ({ template, resumeData }) => {
  if (template?.id === "ats-classic" || template?.isAts) {
    return <AtsClassicRenderer resumeData={resumeData} />;
  }

  // Resolve theme colors
  const resolveColor = (colorKey) => {
    if (!colorKey) return undefined;
    return template?.theme?.colors?.[colorKey] || colorKey;
  };

  // Get nested data using path like "personalInfo.name"
  const getDataByPath = (path, contextData = resumeData) => {
    if (!path) return null;
    return path.split(".").reduce((obj, key) => obj?.[key], contextData);
  };

  // Apply styles with theme color resolution
  const applyStyle = (style) => {
    if (!style) return {};

    const resolved = { ...style };

    // Resolve color references
    if (style.color) resolved.color = resolveColor(style.color);
    if (style.borderColor)
      resolved.borderColor = resolveColor(style.borderColor);
    if (style.backgroundColor)
      resolved.backgroundColor = resolveColor(style.backgroundColor);

    return resolved;
  };

  // Process template strings like "{company} | {location}"
  const processTemplate = (templateStr, data) => {
    if (!templateStr || typeof templateStr !== "string") return templateStr;

    // Handle special join operation for arrays
    if (templateStr.startsWith("{join:")) {
      const match = templateStr.match(/\{join:'(.*)'\}/);
      const separator = match?.[1] || ", ";
      return Array.isArray(data) ? data.join(separator) : data;
    }

    // Replace {field} with actual data
    return templateStr.replace(/\{(\w+)\}/g, (match, field) => {
      return data?.[field] || "";
    });
  };

  // Render icon component
  const renderIcon = (iconName, style = {}) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={style.size || 20} style={style} />;
  };

  // Render single element
  const renderElement = (element, data, index) => {
    const elementData = element.dataPath
      ? getDataByPath(element.dataPath, data)
      : data;
    const style = applyStyle(element.style);

    switch (element.type) {
      case "text": {
        let content;
        if (element.template) {
          if (element.template.startsWith("{join:")) {
            content = processTemplate(element.template, elementData);
          } else {
            content = processTemplate(element.template, data);
          }
        } else {
          content = Array.isArray(elementData)
            ? elementData.join(", ")
            : elementData;
        }

        if (!content) return null;

        return (
          <div key={index} style={style}>
            {content}
          </div>
        );
      }

      case "avatar": {
        const name = elementData || "";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .filter(Boolean)
          .join("")
          .toUpperCase()
          .substring(0, 3); // Safeguard against empty

        return (
          <div key={index} style={style}>
            {initials}
          </div>
        );
      }

      case "contact-row": {
        return (
          <div key={index} style={style}>
            {element.items?.map((item, i) => {
              const value = getDataByPath(item.dataPath, data);
              if (!value) return null;

              const separator =
                element.separator && i > 0 ? (
                  <span style={{ margin: "0 8px" }}>{element.separator}</span>
                ) : null;

              return (
                <React.Fragment key={i}>
                  {separator}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {item.icon && renderIcon(item.icon, { size: 14 })}
                    {value}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        );
      }

      case "contact-list": {
        return (
          <div key={index} style={style}>
            {element.items?.map((item, i) => {
              const value = getDataByPath(item.dataPath, data);
              if (!value) return null;

              return (
                <div key={i} style={element.itemStyle}>
                  {item.icon && renderIcon(item.icon, { size: 16 })}
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        );
      }

      case "list": {
        if (!Array.isArray(elementData)) return null;

        const ListTag = element.listStyle === "none" ? "div" : "ul";
        const listStyleType =
          element.listStyle === "custom" ? "none" : element.listStyle;

        return (
          <ListTag key={index} style={{ ...style, listStyleType }}>
            {elementData.map((item, i) => {
              if (element.listStyle === "custom") {
                return (
                  <div key={i} style={element.itemStyle}>
                    <span style={element.markerStyle}>
                      {element.listMarker}
                    </span>
                    <span>{item}</span>
                  </div>
                );
              }
              return (
                <li key={i} style={element.itemStyle}>
                  {item}
                </li>
              );
            })}
          </ListTag>
        );
      }

      case "tag-list": {
        if (!Array.isArray(elementData)) return null;

        return (
          <div key={index} style={style}>
            {elementData.map((tag, i) => (
              <span key={i} style={applyStyle(element.tagStyle)}>
                {tag}
              </span>
            ))}
          </div>
        );
      }

      case "group": {
        return (
          <div key={index} style={style}>
            {element.elements?.map((el, i) => renderElement(el, data, i))}
          </div>
        );
      }

      case "flex-row": {
        return (
          <div key={index} style={style}>
            {element.elements?.map((el, i) =>
              renderElement(el, data, `flex-${i}`),
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Render section
  const renderSection = (section, data, index) => {
    // Handle layout containers: sidebar and main (used in grid layouts)
    if (section.type === "sidebar" || section.type === "main") {
      const style = applyStyle(section.style);
      const className = `resume-${section.type}`;

      return (
        <div key={index} className={className} style={style}>
          {section.sections?.map((subsection, i) =>
            renderSection(subsection, data, i),
          )}
        </div>
      );
    }

    // Handle content sections
    const style = applyStyle(section.style);

    if (section.type === "repeatable-section") {
      const items = getDataByPath(section.dataPath, data);
      if (!Array.isArray(items) || items.length === 0) return null;

      return (
        <div key={index} style={{ display: "inline-block", width: "100%" }}>
          <div className="resume-section" style={style}>
            {section.showTitle && section.title && (
              <div style={applyStyle(section.titleStyle)}>
                {section.titleIcon && renderIcon(section.titleIcon)}
                {section.title}
              </div>
            )}
            {items.map((item, i) => {
              const itemStyle = applyStyle(section.itemStyle);
              return (
                <div key={i} className="repeatable-item" style={itemStyle}>
                  {section.elements?.map((el, j) => renderElement(el, item, j))}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (section.type === "section") {
      return (
        <div key={index} style={{ display: "inline-block", width: "100%" }}>
          <div className="resume-section" style={style}>
            {section.showTitle && section.title && (
              <div style={applyStyle(section.titleStyle)}>
                {section.titleIcon && renderIcon(section.titleIcon)}
                {section.title}
              </div>
            )}
            {section.elements?.map((el, i) => renderElement(el, data, i))}
          </div>
        </div>
      );
    }

    // Unknown section type
    return null;
  };

  // Render root structure
  const structure = template?.structure || { style: {}, sections: [] };

  const renderStructure = () => {
    const style = applyStyle(structure.style);
    if (!style.fontFamily) {
      style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    }
    // Ensure a default white background if the theme color resolution fails
    if (!style.backgroundColor || style.backgroundColor === "background") {
      style.backgroundColor = resolveColor("background") || "#ffffff";
    }

    return (
      <div
        className="page"
        style={{
          width: "210mm",
          minHeight: "297mm",
          boxSizing: "border-box",
          ...style,
        }}
      >
        {structure.sections?.map((section, i) =>
          renderSection(section, resumeData, i),
        )}
      </div>
    );
  };

  return renderStructure();
};

export default ResumeRenderer;
