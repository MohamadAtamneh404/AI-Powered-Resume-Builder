import React from "react";

/**
 * CanvasPrintRenderer
 * Renders the exact contents of the EditorCanvas in static HTML for 1:1 WYSIWYG PDF export.
 * Excludes all editing chrome (toolbars, buttons, drag handles, placeholders).
 */
export default function CanvasPrintRenderer({
  blocks = [],
  basics = {},
  activeFont = "Inter",
  activeThemeColor = "#111827",
  template = null,
}) {
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
    if (type === "url") {
      return clean.replace(/^https?:\/\/(www\.)?/, "");
    }
    return clean;
  };

  const linkedinRaw =
    basics.linkedin ||
    (basics.profiles || []).find((p) => p.network?.toLowerCase() === "linkedin")?.username ||
    "";
  const githubRaw =
    basics.github ||
    (basics.profiles || []).find((p) => p.network?.toLowerCase() === "github")?.username ||
    "";

  const rawItems = [
    basics.email,
    basics.phone,
    basics.location?.city || (typeof basics.location === "string" ? basics.location : ""),
    formatLink("url", basics.url),
    formatLink("linkedin", linkedinRaw),
    formatLink("github", githubRaw),
  ].filter(Boolean);

  const seen = new Set();
  const contactItems = rawItems.filter((item) => {
    const lower = item.toLowerCase().replace(/\/+$/, "");
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  const layoutVariant = template?.layoutVariant || "classic";
  const layoutPadding =
    layoutVariant === "compact"
      ? "24px 32px"
      : layoutVariant === "executive"
        ? "40px 48px"
        : "36px 44px";

  const effectiveFont = activeFont || template?.fontFamily || "Inter";
  const primaryColor =
    activeThemeColor && activeThemeColor !== "#9fff00"
      ? activeThemeColor
      : template?.theme?.colors?.primary || "#111827";

  const renderSectionHeading = (title) => {
    let headingStyle = {
      borderBottom: `1.5px solid ${primaryColor}`,
      color: primaryColor !== "#111827" ? primaryColor : "#111827",
      fontSize: "12px",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      paddingBottom: "4px",
      marginBottom: layoutVariant === "compact" ? "6px" : "10px",
    };

    if (layoutVariant === "modern") {
      headingStyle = {
        borderLeft: `4px solid ${primaryColor}`,
        color: primaryColor,
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        paddingLeft: "10px",
        paddingBottom: "2px",
        marginBottom: "10px",
      };
    } else if (layoutVariant === "executive") {
      headingStyle = {
        borderTop: "1px solid #94a3b8",
        borderBottom: "1px solid #94a3b8",
        color: primaryColor !== "#111827" ? primaryColor : "#1e293b",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        textAlign: "center",
        padding: "4px 0",
        marginBottom: "12px",
        fontFamily: "Georgia, serif",
      };
    } else if (layoutVariant === "developer") {
      headingStyle = {
        borderBottom: `2px solid ${primaryColor}`,
        color: primaryColor,
        fontSize: "12px",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        paddingBottom: "4px",
        marginBottom: "10px",
        fontFamily: "monospace",
      };
    } else if (layoutVariant === "compact") {
      headingStyle = {
        borderBottom: "1px solid #cbd5e1",
        color: "#0f172a",
        fontSize: "11px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        paddingBottom: "2px",
        marginBottom: "6px",
      };
    }

    return (
      <div style={headingStyle}>
        {layoutVariant === "developer" ? `// ${title}` : title}
      </div>
    );
  };

  let headerWrapperStyle = {
    paddingBottom: "16px",
    marginBottom: "20px",
    borderBottom: `1.5px solid ${primaryColor}`,
    textAlign: "center",
  };
  let nameStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#111827",
  };
  let contactJustify = "justify-center";

  if (layoutVariant === "executive") {
    headerWrapperStyle = {
      paddingBottom: "16px",
      marginBottom: "20px",
      borderBottom: "3px double #334155",
      textAlign: "center",
    };
    nameStyle = {
      fontSize: "26px",
      fontFamily: "Georgia, serif",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      color: primaryColor !== "#111827" ? primaryColor : "#1e293b",
    };
    contactJustify = "justify-center font-serif";
  } else if (layoutVariant === "modern") {
    headerWrapperStyle = {
      paddingBottom: "16px",
      marginBottom: "20px",
      borderBottom: `2px solid ${primaryColor}`,
      textAlign: "left",
    };
    nameStyle = {
      fontSize: "26px",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: primaryColor !== "#111827" ? primaryColor : "#111827",
    };
    contactJustify = "justify-start";
  } else if (layoutVariant === "developer") {
    headerWrapperStyle = {
      paddingBottom: "14px",
      marginBottom: "16px",
      borderBottom: `2px solid ${primaryColor}`,
      textAlign: "left",
    };
    nameStyle = {
      fontSize: "24px",
      fontWeight: "bold",
      fontFamily: "monospace",
      letterSpacing: "0.05em",
      color: primaryColor,
    };
    contactJustify = "justify-start font-mono text-[11px]";
  } else if (layoutVariant === "compact") {
    headerWrapperStyle = {
      paddingBottom: "8px",
      marginBottom: "12px",
      borderBottom: "1px solid #cbd5e1",
      textAlign: "left",
    };
    nameStyle = {
      fontSize: "20px",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#0f172a",
    };
    contactJustify = "justify-start text-[11px]";
  }

  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto bg-white text-left leading-normal text-gray-900"
      style={{
        fontFamily: `'${effectiveFont}', system-ui, -apple-system, sans-serif`,
        padding: layoutPadding,
        boxSizing: "border-box",
      }}
    >
      {blocks.map((block, index) => {
        if (!block) return null;

        switch (block.type) {
          case "header":
            return (
              <header key={index} style={headerWrapperStyle}>
                <h1 style={nameStyle}>
                  {basics.name || "Your Name"}
                </h1>
                {basics.label && (
                  <div
                    className="text-sm sm:text-base font-medium mt-0.5"
                    style={{
                      color: layoutVariant === "developer" ? primaryColor : "#374151",
                      fontFamily: layoutVariant === "developer" ? "monospace" : undefined,
                    }}
                  >
                    {basics.label}
                  </div>
                )}
                {contactItems.length > 0 && (
                  <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-gray-700 ${contactJustify}`}>
                    {contactItems.map((item, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-gray-400">•</span>}
                        <span>{item}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </header>
            );

          case "summary":
            if (!block.content) return null;
            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Professional Summary")}
                <p
                  className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line"
                  style={{
                    fontFamily: layoutVariant === "executive" ? "Georgia, serif" : undefined,
                  }}
                >
                  {block.content}
                </p>
              </section>
            );

          case "work": {
            const entries = (block.entries || []).filter(
              (e) => e.company || e.position || e.summary || (e.highlights && e.highlights.length > 0),
            );
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Work Experience")}
                <div className="space-y-4">
                  {entries.map((item, i) => {
                    const bullets = item.summary

                      ? item.summary.split("\n").filter(Boolean)
                      : item.highlights || [];

                    return (
                      <div key={i} className="text-xs sm:text-sm">
                        <div className="flex justify-between items-baseline flex-wrap gap-1">
                          <div>
                            <span className="font-bold text-gray-900">
                              {item.position || "Role"}
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
            );
          }

          case "education": {
            const entries = (block.entries || []).filter(
              (e) => e.institution || e.studyType || e.area || e.degree,
            );
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Education")}
                <div className="space-y-2.5">
                  {entries.map((item, i) => (
                    <div key={i} className="text-xs sm:text-sm">
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <div>
                          <span className="font-bold text-gray-900">
                            {item.studyType || item.degree || "Degree"}
                            {item.area ? ` in ${item.area}` : ""}
                          </span>
                          {item.institution && (
                            <span className="italic text-gray-800">
                              {" "}
                              | {item.institution}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
                        </div>
                      </div>
                      {item.score && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          GPA: {item.score}
                        </div>
                      )}
                      {item.summary && (
                        <p className="text-xs text-gray-700 mt-0.5">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "skills": {
            const groups = (block.groups || []).filter(
              (g) => g.name || (g.keywords && g.keywords.length > 0),
            );
            if (groups.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Skills & Competencies")}
                <div className="text-xs sm:text-sm text-gray-800 space-y-1.5">
                  {groups.map((group, gi) => (
                    <div key={gi} className="flex items-baseline flex-wrap gap-x-2">
                      <span className="font-bold text-gray-900">
                        {group.name}:
                      </span>
                      <span style={{ fontFamily: layoutVariant === "developer" ? "monospace" : undefined }}>
                        {(group.keywords || []).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "projects": {
            const entries = (block.entries || []).filter(
              (p) => p.name || p.description,
            );
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Key Projects")}
                <div className="space-y-2.5">
                  {entries.map((proj, pi) => (
                    <div key={pi} className="text-xs sm:text-sm">
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <span className="font-bold text-gray-900">
                          {proj.name}
                        </span>
                        {proj.url && (
                          <span className="text-xs text-gray-600">
                            {proj.url}
                          </span>
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
            );
          }

          case "languages": {
            const entries = (block.entries || []).filter((l) => l.language);
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-2.5" : "mb-4"}>
                {renderSectionHeading(block.title || "Languages")}
                <div className="text-xs sm:text-sm text-gray-800 flex flex-wrap gap-x-4 gap-y-1">
                  {entries.map((l, li) => (
                    <span key={li}>
                      <span className="font-medium text-gray-900">
                        {l.language}
                      </span>
                      {l.fluency ? (
                        <span className="text-gray-600"> ({l.fluency})</span>
                      ) : (
                        ""
                      )}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          case "awards": {
            const entries = (block.entries || []).filter((a) => a.title);
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Certifications & Awards")}
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs sm:text-sm text-gray-800">
                  {entries.map((item, i) => (
                    <li key={i}>
                      <span className="font-bold text-gray-900">
                        {item.title}
                      </span>
                      {item.awarder ? ` – ${item.awarder}` : ""}
                      {item.date ? ` (${item.date})` : ""}
                      {item.summary && (
                        <p className="text-gray-700 mt-0.5">{item.summary}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          case "volunteer": {
            const entries = (block.entries || []).filter((v) => v.position || v.organization);
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Volunteer Experience")}
                <div className="space-y-2.5">
                  {entries.map((item, i) => (
                    <div key={i} className="text-xs sm:text-sm">
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <div>
                          <span className="font-bold text-gray-900">
                            {item.position}
                          </span>
                          {item.organization && (
                            <span className="italic text-gray-800">
                              {" "}
                              at {item.organization}
                            </span>
                          )}
                        </div>
                        {(item.startDate || item.endDate) && (
                          <div className="text-xs font-medium text-gray-700">
                            {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
                          </div>
                        )}
                      </div>
                      {item.summary && (
                        <p className="text-xs text-gray-700 mt-0.5">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "publications": {
            const entries = (block.entries || []).filter((p) => p.name);
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-3" : "mb-5"}>
                {renderSectionHeading(block.title || "Publications")}
                <div className="space-y-2 text-xs sm:text-sm text-gray-800">
                  {entries.map((item, i) => (
                    <div key={i}>
                      <span className="font-bold text-gray-900">
                        {item.name}
                      </span>
                      {item.publisher ? ` by ${item.publisher}` : ""}
                      {item.releaseDate ? ` (${item.releaseDate})` : ""}
                      {item.url && (
                        <div className="text-xs text-gray-600">{item.url}</div>
                      )}
                      {item.summary && (
                        <p className="text-xs text-gray-700 mt-0.5">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "interests": {
            const entries = (block.entries || []).filter((it) => it.name);
            if (entries.length === 0) return null;

            return (
              <section key={index} className={layoutVariant === "compact" ? "mb-2.5" : "mb-4"}>
                {renderSectionHeading(block.title || "Interests")}
                <div className="text-xs sm:text-sm text-gray-800 space-y-1">
                  {entries.map((item, i) => (
                    <div key={i}>
                      <span className="font-bold text-gray-900">
                        {item.name}:{" "}
                      </span>
                      <span>
                        {Array.isArray(item.keywords)
                          ? item.keywords.join(", ")
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

