const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Template = require("../models/Template");

dotenv.config();

// ─── Shared Section Builders ───────────────────────────────────────────────────
// These factory functions produce section definitions for each resume section.
// Every template reuses them with style overrides so ALL 11 sections are always present.

function headerSection(style = {}, titleStyle = {}, contactStyle = {}) {
  return {
    id: "header",
    type: "section",
    style: { marginBottom: "20px", ...style },
    elements: [
      {
        type: "text",
        dataPath: "personalInfo.name",
        style: {
          fontSize: "28px",
          fontWeight: "bold",
          color: "primary",
          ...titleStyle,
        },
      },
      {
        type: "text",
        dataPath: "personalInfo.title",
        style: {
          fontSize: "14px",
          color: "secondary",
          marginTop: "2px",
        },
      },
      {
        type: "contact-row",
        separator: "•",
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "8px",
          fontSize: "12px",
          color: "secondary",
          ...contactStyle,
        },
        items: [
          { dataPath: "personalInfo.email", icon: "mail" },
          { dataPath: "personalInfo.phone", icon: "phone" },
          { dataPath: "personalInfo.location", icon: "map-pin" },
          { dataPath: "personalInfo.website" },
          { dataPath: "personalInfo.linkedin" },
          { dataPath: "personalInfo.github" },
        ],
      },
    ],
  };
}

function sectionTitle(titleStyleOverrides = {}) {
  return {
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "primary",
    borderBottom: "1.5px solid",
    borderColor: "primary",
    paddingBottom: "4px",
    marginBottom: "12px",
    ...titleStyleOverrides,
  };
}

function summarySection(titleSt = {}) {
  return {
    id: "summary",
    type: "section",
    showTitle: true,
    title: "Professional Summary",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    elements: [
      {
        type: "text",
        dataPath: "personalInfo.summary",
        style: {
          fontSize: "12px",
          lineHeight: "1.6",
          color: "#374151",
        },
      },
    ],
  };
}

function experienceSection(titleSt = {}, itemStyle = {}) {
  return {
    id: "experience",
    type: "repeatable-section",
    showTitle: true,
    title: "Experience",
    dataPath: "experience",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "16px", ...itemStyle },
    elements: [
      {
        type: "flex-row",
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "4px",
        },
        elements: [
          {
            type: "group",
            elements: [
              {
                type: "text",
                dataPath: "title",
                style: { fontSize: "14px", fontWeight: "bold", color: "#111827" },
              },
              {
                type: "text",
                template: "{company} | {location}",
                style: {
                  fontSize: "12px",
                  fontStyle: "italic",
                  color: "secondary",
                },
              },
            ],
          },
          {
            type: "text",
            template: "{startDate} - {endDate}",
            style: { fontSize: "11px", color: "secondary", whiteSpace: "nowrap" },
          },
        ],
      },
      {
        type: "list",
        dataPath: "description",
        listStyle: "disc",
        style: {
          marginLeft: "16px",
          marginTop: "6px",
          fontSize: "12px",
          color: "#374151",
          lineHeight: "1.5",
        },
        itemStyle: { marginBottom: "2px" },
      },
    ],
  };
}

function educationSection(titleSt = {}) {
  return {
    id: "education",
    type: "repeatable-section",
    showTitle: true,
    title: "Education",
    dataPath: "education",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "12px" },
    elements: [
      {
        type: "flex-row",
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "4px",
        },
        elements: [
          {
            type: "group",
            elements: [
              {
                type: "text",
                template: "{degree} in {area}",
                style: { fontSize: "14px", fontWeight: "bold", color: "#111827" },
              },
              {
                type: "text",
                dataPath: "institution",
                style: { fontSize: "12px", fontStyle: "italic", color: "secondary" },
              },
            ],
          },
          {
            type: "text",
            template: "{startDate} - {endDate}",
            style: { fontSize: "11px", color: "secondary", whiteSpace: "nowrap" },
          },
        ],
      },
      {
        type: "text",
        dataPath: "gpa",
        style: { fontSize: "11px", color: "#6b7280", marginTop: "2px" },
      },
    ],
  };
}

function skillsSection(titleSt = {}, tagStyle = {}) {
  return {
    id: "skills",
    type: "repeatable-section",
    showTitle: true,
    title: "Skills",
    dataPath: "skillGroups",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "8px" },
    elements: [
      {
        type: "text",
        dataPath: "name",
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#111827",
          marginBottom: "4px",
        },
      },
      {
        type: "tag-list",
        dataPath: "keywords",
        style: { display: "flex", flexWrap: "wrap", gap: "4px" },
        tagStyle: {
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "500",
          ...tagStyle,
        },
      },
    ],
  };
}

function skillsSectionText(titleSt = {}) {
  return {
    id: "skills",
    type: "repeatable-section",
    showTitle: true,
    title: "Skills",
    dataPath: "skillGroups",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "4px" },
    elements: [
      {
        type: "text",
        dataPath: "name",
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#111827",
          display: "inline",
        },
      },
      {
        type: "text",
        dataPath: "keywords",
        template: "{join:', '}",
        style: {
          fontSize: "12px",
          color: "#374151",
          display: "inline",
          marginLeft: "4px",
        },
      },
    ],
  };
}

function projectsSection(titleSt = {}, tagStyle = {}) {
  return {
    id: "projects",
    type: "repeatable-section",
    showTitle: true,
    title: "Projects",
    dataPath: "projects",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "14px" },
    elements: [
      {
        type: "flex-row",
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        },
        elements: [
          {
            type: "text",
            dataPath: "name",
            style: { fontSize: "13px", fontWeight: "bold", color: "primary" },
          },
          {
            type: "text",
            dataPath: "url",
            style: { fontSize: "11px", color: "secondary" },
          },
        ],
      },
      {
        type: "text",
        dataPath: "description",
        style: {
          fontSize: "12px",
          color: "#374151",
          marginTop: "4px",
          lineHeight: "1.5",
        },
      },
      {
        type: "tag-list",
        dataPath: "technologies",
        style: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" },
        tagStyle: {
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          ...tagStyle,
        },
      },
    ],
  };
}

function awardsSection(titleSt = {}) {
  return {
    id: "awards",
    type: "repeatable-section",
    showTitle: true,
    title: "Awards & Certifications",
    dataPath: "awards",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "10px" },
    elements: [
      {
        type: "text",
        dataPath: "title",
        style: { fontSize: "13px", fontWeight: "bold", color: "#111827" },
      },
      {
        type: "text",
        template: "{awarder} | {date}",
        style: { fontSize: "12px", color: "secondary" },
      },
      {
        type: "text",
        dataPath: "summary",
        style: { fontSize: "12px", color: "#374151", marginTop: "2px" },
      },
    ],
  };
}

function volunteerSection(titleSt = {}) {
  return {
    id: "volunteer",
    type: "repeatable-section",
    showTitle: true,
    title: "Volunteer Experience",
    dataPath: "volunteer",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "14px" },
    elements: [
      {
        type: "flex-row",
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
        },
        elements: [
          {
            type: "group",
            elements: [
              {
                type: "text",
                dataPath: "position",
                style: { fontSize: "13px", fontWeight: "bold", color: "#111827" },
              },
              {
                type: "text",
                dataPath: "organization",
                style: { fontSize: "12px", fontStyle: "italic", color: "secondary" },
              },
            ],
          },
          {
            type: "text",
            template: "{startDate} - {endDate}",
            style: { fontSize: "11px", color: "secondary" },
          },
        ],
      },
      {
        type: "text",
        dataPath: "summary",
        style: { fontSize: "12px", color: "#374151", marginTop: "4px" },
      },
    ],
  };
}

function publicationsSection(titleSt = {}) {
  return {
    id: "publications",
    type: "repeatable-section",
    showTitle: true,
    title: "Publications",
    dataPath: "publications",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "10px" },
    elements: [
      {
        type: "text",
        dataPath: "name",
        style: { fontSize: "13px", fontWeight: "bold", color: "#111827" },
      },
      {
        type: "text",
        template: "{publisher} | {releaseDate}",
        style: { fontSize: "12px", color: "secondary" },
      },
      {
        type: "text",
        dataPath: "summary",
        style: { fontSize: "12px", color: "#374151", marginTop: "2px" },
      },
    ],
  };
}

function languagesSection(titleSt = {}) {
  return {
    id: "languages",
    type: "repeatable-section",
    showTitle: true,
    title: "Languages",
    dataPath: "languages",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "4px" },
    elements: [
      {
        type: "text",
        template: "{language}: {fluency}",
        style: { fontSize: "12px", color: "#374151" },
      },
    ],
  };
}

function interestsSection(titleSt = {}, tagStyle = {}) {
  return {
    id: "interests",
    type: "repeatable-section",
    showTitle: true,
    title: "Interests",
    dataPath: "interests",
    style: { marginBottom: "20px" },
    titleStyle: sectionTitle(titleSt),
    itemStyle: { marginBottom: "8px" },
    elements: [
      {
        type: "text",
        dataPath: "name",
        style: { fontSize: "12px", fontWeight: "bold", color: "#111827" },
      },
      {
        type: "tag-list",
        dataPath: "keywords",
        style: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" },
        tagStyle: {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          ...tagStyle,
        },
      },
    ],
  };
}

// ─── Template Definitions ──────────────────────────────────────────────────────

const templates = [
  // ── 1. Professional Modern ─────────────────────────────────────────────────
  {
    id: "professional-modern",
    name: "Professional Modern",
    description:
      "Clean single-column layout with accent borders and a polished professional look.",
    category: "Professional",
    theme: {
      colors: {
        primary: "#1e40af",
        secondary: "#6b7280",
        accent: "#1e40af",
        text: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      type: "container",
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "36px 44px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        lineHeight: "1.5",
      },
      sections: [
        headerSection(
          { borderLeft: "4px solid", borderColor: "primary", paddingLeft: "16px" },
          { fontSize: "30px" },
          {}
        ),
        summarySection(),
        experienceSection(),
        educationSection(),
        skillsSection(),
        projectsSection(),
        awardsSection(),
        volunteerSection(),
        publicationsSection(),
        languagesSection(),
        interestsSection(),
      ],
    },
  },

  // ── 2. Executive Elegant ───────────────────────────────────────────────────
  {
    id: "executive-elegant",
    name: "Executive Elegant",
    description:
      "Centered, refined corporate layout ideal for senior roles and executive positions.",
    category: "Executive",
    theme: {
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#374151",
        text: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      type: "container",
      style: {
        maxWidth: "780px",
        margin: "0 auto",
        padding: "40px 48px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        lineHeight: "1.6",
      },
      sections: [
        // Centered header
        {
          id: "header",
          type: "section",
          style: {
            textAlign: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #1f2937",
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.name",
              style: {
                fontSize: "32px",
                fontWeight: "bold",
                color: "primary",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              },
            },
            {
              type: "text",
              dataPath: "personalInfo.title",
              style: {
                fontSize: "14px",
                color: "secondary",
                marginTop: "4px",
                fontStyle: "italic",
              },
            },
            {
              type: "contact-row",
              separator: "•",
              style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "6px",
                marginTop: "10px",
                fontSize: "12px",
                color: "secondary",
              },
              items: [
                { dataPath: "personalInfo.email", icon: "mail" },
                { dataPath: "personalInfo.phone", icon: "phone" },
                { dataPath: "personalInfo.location", icon: "map-pin" },
                { dataPath: "personalInfo.website" },
                { dataPath: "personalInfo.linkedin" },
                { dataPath: "personalInfo.github" },
              ],
            },
          ],
        },
        summarySection({
          textAlign: "center",
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
          fontSize: "12px",
        }),
        experienceSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        educationSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        skillsSectionText({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        projectsSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        awardsSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        volunteerSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        publicationsSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        languagesSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
        interestsSection({
          borderBottom: "1px solid #d1d5db",
          borderColor: undefined,
        }),
      ],
    },
  },

  // ── 3. Developer Focused ───────────────────────────────────────────────────
  {
    id: "developer-focused",
    name: "Developer Focused",
    description:
      "Tech-optimized layout with prominent skill tags and project sections for developers.",
    category: "Engineering & Tech",
    theme: {
      colors: {
        primary: "#7c3aed",
        secondary: "#6b7280",
        accent: "#7c3aed",
        text: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      type: "container",
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "36px 44px",
        fontFamily: "'Inter', 'SF Mono', system-ui, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        lineHeight: "1.5",
      },
      sections: [
        headerSection(
          {
            backgroundColor: "#f5f3ff",
            padding: "20px 24px",
            borderRadius: "8px",
            borderLeft: "4px solid",
            borderColor: "primary",
          },
          { fontSize: "28px", color: "primary" },
          {}
        ),
        summarySection(),
        // Skills first for developers
        skillsSection({}, {
          backgroundColor: "#f5f3ff",
          color: "#5b21b6",
          border: "1px solid #ddd6fe",
          borderRadius: "6px",
        }),
        experienceSection(),
        projectsSection({}, {
          backgroundColor: "#f5f3ff",
          color: "#5b21b6",
          border: "1px solid #ddd6fe",
          borderRadius: "6px",
        }),
        educationSection(),
        awardsSection(),
        publicationsSection(),
        volunteerSection(),
        languagesSection(),
        interestsSection(),
      ],
    },
  },

  // ── 4. Creative Split (Two-Column) ─────────────────────────────────────────
  {
    id: "creative-split",
    name: "Creative Split",
    description:
      "Modern two-column layout with a tinted sidebar for contact, skills, and languages.",
    category: "Creative",
    theme: {
      colors: {
        primary: "#0f766e",
        secondary: "#6b7280",
        accent: "#0f766e",
        text: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      type: "grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        lineHeight: "1.5",
        minHeight: "100%",
      },
      sections: [
        // ── Sidebar ──
        {
          type: "sidebar",
          style: {
            backgroundColor: "#f0fdfa",
            padding: "32px 20px",
            borderRight: "1px solid #ccfbf1",
          },
          sections: [
            // Name & title in sidebar
            {
              id: "header",
              type: "section",
              style: { marginBottom: "24px", textAlign: "center" },
              elements: [
                {
                  type: "avatar",
                  dataPath: "personalInfo.name",
                  style: {
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#0f766e",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "bold",
                    margin: "0 auto 12px auto",
                  },
                },
                {
                  type: "text",
                  dataPath: "personalInfo.name",
                  style: {
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "primary",
                  },
                },
                {
                  type: "text",
                  dataPath: "personalInfo.title",
                  style: { fontSize: "12px", color: "secondary", marginTop: "2px" },
                },
              ],
            },
            // Contact in sidebar
            {
              id: "contact",
              type: "section",
              showTitle: true,
              title: "Contact",
              style: { marginBottom: "20px" },
              titleStyle: {
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "primary",
                borderBottom: "1px solid",
                borderColor: "primary",
                paddingBottom: "4px",
                marginBottom: "10px",
              },
              elements: [
                {
                  type: "contact-list",
                  style: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" },
                  itemStyle: { display: "flex", alignItems: "center", gap: "6px", color: "#374151" },
                  items: [
                    { dataPath: "personalInfo.email", icon: "mail" },
                    { dataPath: "personalInfo.phone", icon: "phone" },
                    { dataPath: "personalInfo.location", icon: "map-pin" },
                    { dataPath: "personalInfo.website" },
                    { dataPath: "personalInfo.linkedin" },
                    { dataPath: "personalInfo.github" },
                  ],
                },
              ],
            },
            // Skills in sidebar
            skillsSection(
              { borderColor: "primary" },
              {
                backgroundColor: "#ccfbf1",
                color: "#0f766e",
                border: "none",
                borderRadius: "4px",
              }
            ),
            languagesSection({ borderColor: "primary" }),
            interestsSection(
              { borderColor: "primary" },
              { backgroundColor: "#ccfbf1", color: "#0f766e", border: "none" }
            ),
          ],
        },
        // ── Main Content ──
        {
          type: "main",
          style: { padding: "32px 28px" },
          sections: [
            summarySection(),
            experienceSection(),
            educationSection(),
            projectsSection(),
            awardsSection(),
            volunteerSection(),
            publicationsSection(),
          ],
        },
      ],
    },
  },

  // ── 5. Clean Minimal ───────────────────────────────────────────────────────
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description:
      "Ultra-clean layout with generous whitespace, thin dividers, and understated elegance.",
    category: "Minimal",
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#9ca3af",
        accent: "#111827",
        text: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      type: "container",
      style: {
        maxWidth: "760px",
        margin: "0 auto",
        padding: "48px 52px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        lineHeight: "1.6",
      },
      sections: [
        // Minimal header — large name, thin line
        {
          id: "header",
          type: "section",
          style: {
            marginBottom: "28px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb",
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.name",
              style: {
                fontSize: "36px",
                fontWeight: "300",
                color: "#111827",
                letterSpacing: "-0.01em",
              },
            },
            {
              type: "text",
              dataPath: "personalInfo.title",
              style: {
                fontSize: "13px",
                color: "#9ca3af",
                marginTop: "2px",
                fontWeight: "400",
              },
            },
            {
              type: "contact-row",
              separator: "·",
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "10px",
                fontSize: "11px",
                color: "#9ca3af",
              },
              items: [
                { dataPath: "personalInfo.email" },
                { dataPath: "personalInfo.phone" },
                { dataPath: "personalInfo.location" },
                { dataPath: "personalInfo.website" },
                { dataPath: "personalInfo.linkedin" },
                { dataPath: "personalInfo.github" },
              ],
            },
          ],
        },
        summarySection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        experienceSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        educationSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        skillsSectionText({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        projectsSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        awardsSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        volunteerSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        publicationsSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        languagesSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
        interestsSection({
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
          color: "#9ca3af",
          borderBottom: "1px solid #e5e7eb",
          borderColor: undefined,
        }),
      ],
    },
  },
];

// ─── Seed Runner ───────────────────────────────────────────────────────────────

const seedDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_resume",
    );
    console.log("Connected to MongoDB");

    await Template.deleteMany({});
    console.log("Cleared old templates");

    await Template.insertMany(templates);
    console.log(`✅ Seeded ${templates.length} templates:`);
    templates.forEach((t) => console.log(`   - ${t.id}: ${t.name}`));
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedDB();
