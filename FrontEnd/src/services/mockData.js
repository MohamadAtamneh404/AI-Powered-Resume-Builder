// src/services/mockData.js
// Rich demo data for showcase and preview mode

export const DEMO_USER = {
  _id: "demo-user-123",
  uid: "demo-user-123",
  id: "demo-user-123",
  email: "alex.morgan@demo.com",
  name: "Alex Morgan",
  displayName: "Alex Morgan",
  photoURL:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  jobTitle: "Senior Full Stack Engineer",
  location: "San Francisco, CA",
  phone: "+1 (555) 019-2834",
  bio: "Senior software engineer with 6+ years building scalable distributed architectures and polished web applications.",
  careerProfile: {
    targetRole: "Senior / Staff Software Engineer",
    experienceLevel: "Senior (6+ years)",
    primarySkills: [
      "React",
      "TypeScript",
      "Node.js",
      "Tailwind CSS",
      "Next.js",
      "GraphQL",
      "Docker",
    ],
  },
  settings: {
    emailNotifications: true,
    theme: "light",
    exportEngine: "client-print",
  },
};

export const DEMO_TEMPLATES = [
  {
    id: "ats-modern",
    name: "ATS Modern Accent",
    category: "ATS Modern",
    description:
      "Sleek left accent color borders and contemporary typography with 100% machine readability.",
    isAts: true,
    fontFamily: "Outfit",
    layoutVariant: "modern",
    theme: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#2563eb",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Outfit, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-classic",
    name: "ATS Classic",
    category: "ATS Minimalist",
    description:
      "100% ATS-optimized single-column layout for maximum parser pass rates.",
    isAts: true,
    fontFamily: "Inter",
    layoutVariant: "classic",
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#475569",
        accent: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-executive",
    name: "ATS Executive Serif",
    category: "ATS Corporate",
    description:
      "Centered aristocratic header with Georgia serif typography and refined horizontal divider rules.",
    isAts: true,
    fontFamily: "Georgia",
    layoutVariant: "executive",
    theme: {
      colors: {
        primary: "#1e293b",
        secondary: "#64748b",
        accent: "#334155",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Georgia, serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "40px 48px",
      },
      sections: [],
    },
  },
  {
    id: "ats-developer",
    name: "ATS Tech & Developer",
    category: "ATS Engineering",
    description:
      "Designed for software engineers and architects with skill-first prioritization and monospace accents.",
    isAts: true,
    fontFamily: "Roboto",
    layoutVariant: "developer",
    theme: {
      colors: {
        primary: "#0f766e",
        secondary: "#475569",
        accent: "#0f766e",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Roboto, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
      },
      sections: [],
    },
  },
  {
    id: "ats-compact",
    name: "ATS Compact 1-Page",
    category: "ATS High-Density",
    description:
      "High-density single-page structure engineered to fit full careers cleanly without page overflow.",
    isAts: true,
    fontFamily: "Inter",
    layoutVariant: "compact",
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#4b5563",
        accent: "#111827",
        background: "#ffffff",
      },
    },
    structure: {
      style: {
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
        padding: "24px 32px",
      },
      sections: [],
    },
  },
];

export const DEMO_RESUMES = [
  {
    _id: "demo-resume-1",
    id: "demo-resume-1",
    title: "Senior Full Stack Engineer",
    templateId: "ats-modern",
    atsScore: 96,
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    theme: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#2563eb",
        background: "#ffffff",
      },
    },
    basics: {
      name: "Alex Morgan",
      label: "Senior Full Stack Engineer",
      email: "alex.morgan@demo.com",
      phone: "+1 (555) 019-2834",
      url: "https://alexmorgan.dev",
      location: {
        city: "San Francisco",
        region: "CA",
        countryCode: "US",
      },
      linkedin: "linkedin.com/in/alex-morgan-dev",
      github: "github.com/alexmorgan",
      profiles: [
        {
          network: "LinkedIn",
          username: "alex-morgan-dev",
          url: "https://linkedin.com/in/alex-morgan-dev",
        },
        {
          network: "GitHub",
          username: "alexmorgan",
          url: "https://github.com/alexmorgan",
        },
      ],
    },
    blocks: [
      {
        id: "block-header",
        type: "header",
        title: "Contact Info",
        options: {},
      },
      {
        id: "block-summary",
        type: "summary",
        title: "Professional Summary",
        content:
          "Innovative Senior Software Engineer with 6+ years of experience architecting high-throughput distributed systems and intuitive client-facing web applications. Proven track record of reducing latency by 34%, optimizing cloud infrastructure, and leading high-performing cross-functional engineering teams.",
      },
      {
        id: "block-work",
        type: "work",
        title: "Work Experience",
        entries: [
          {
            id: "work-1",
            company: "Stripe",
            position: "Senior Software Engineer",
            startDate: "2022-03",
            endDate: "Present",
            summary:
              "Led frontend and API architecture for high-volume merchant billing systems.",
            highlights: [
              "Architected payment reconciliation pipeline processing $45M+ in monthly transaction volume with 99.999% uptime.",
              "Spearheaded redesign of checkout component library using React and Tailwind, improving Core Web Vitals score from 71 to 98.",
              "Mentored 6 software engineers and established end-to-end automated testing pipelines cutting regressions by 40%.",
            ],
          },
          {
            id: "work-2",
            company: "Airbnb",
            position: "Software Engineer II",
            startDate: "2019-06",
            endDate: "2022-02",
            summary:
              "Designed host tools and real-time inventory management features.",
            highlights: [
              "Built real-time host metrics dashboard using React, TypeScript, and GraphQL subscribed to Kafka streams.",
              "Reduced cloud infrastructure costs by 28% through aggressive cache invalidation strategies and Redis query optimizations.",
              "Collaborated closely with UX design teams to roll out multi-currency localized checkout across 32 countries.",
            ],
          },
        ],
      },
      {
        id: "block-education",
        type: "education",
        title: "Education",
        entries: [
          {
            id: "edu-1",
            institution: "University of California, Berkeley",
            studyType: "Bachelor of Science",
            area: "Computer Science",
            startDate: "2015-09",
            endDate: "2019-05",
            score: "3.85 GPA",
            summary: "Honors Graduate, Dean's List 2017-2019.",
          },
        ],
      },
      {
        id: "block-skills",
        type: "skills",
        title: "Skills & Proficiencies",
        groups: [
          {
            name: "Frontend",
            level: "Expert",
            keywords: [
              "React",
              "Next.js",
              "TypeScript",
              "Tailwind CSS",
              "Redux Toolkit",
              "Framer Motion",
            ],
          },
          {
            name: "Backend & Systems",
            level: "Advanced",
            keywords: [
              "Node.js",
              "Express",
              "PostgreSQL",
              "MongoDB",
              "GraphQL",
              "Redis",
              "Docker",
              "AWS",
            ],
          },
          {
            name: "Methodologies",
            level: "Advanced",
            keywords: [
              "CI/CD Pipelines",
              "System Design",
              "Microservices",
              "Automated Testing (Jest, Playwright)",
            ],
          },
        ],
      },
      {
        id: "block-projects",
        type: "projects",
        title: "Key Projects",
        entries: [
          {
            id: "proj-1",
            name: "CloudPulse Telemetry Dashboard",
            description:
              "Open-source distributed system monitoring dashboard built with React and WebSockets.",
            url: "https://github.com/alexmorgan/cloudpulse",
            technologies: [
              "React",
              "TypeScript",
              "Tailwind",
              "WebSockets",
              "Go",
            ],
          },
          {
            id: "proj-2",
            name: "AI Markdown Resume Engine",
            description:
              "High-performance client-side resume layout engine with automatic page break calculations.",
            url: "https://github.com/alexmorgan/resume-engine",
            technologies: ["JavaScript", "HTML5 Canvas", "Tailwind CSS"],
          },
        ],
      },
    ],
  },
  {
    _id: "demo-resume-2",
    id: "demo-resume-2",
    title: "Staff Product Designer",
    templateId: "ats-executive",
    atsScore: 92,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    theme: {
      colors: {
        primary: "#1e293b",
        secondary: "#64748b",
        accent: "#334155",
        background: "#ffffff",
      },
    },
    basics: {
      name: "Alex Morgan",
      label: "Staff Product Designer & Design Engineer",
      email: "alex.morgan@demo.com",
      phone: "+1 (555) 019-2834",
      url: "https://alexmorgan.design",
      location: {
        city: "San Francisco",
        region: "CA",
        countryCode: "US",
      },
      linkedin: "linkedin.com/in/alex-morgan-dev",
      github: "github.com/alexmorgan",
      profiles: [],
    },
    blocks: [
      {
        id: "block-header-2",
        type: "header",
        title: "Header",
        options: {},
      },
      {
        id: "block-summary-2",
        type: "summary",
        title: "Summary",
        content:
          "Human-centric Product Designer with a strong engineering foundation. Expert at transforming complex software challenges into elegant, high-conversion user interfaces.",
      },
      {
        id: "block-work-2",
        type: "work",
        title: "Experience",
        entries: [
          {
            id: "work-2-1",
            company: "Linear",
            position: "Staff Product Designer",
            startDate: "2021-01",
            endDate: "Present",
            summary:
              "Directed UI design system and developer interaction models.",
            highlights: [
              "Designed keyboard-first navigation patterns adopted by over 250,000 active developers.",
              "Built unified component tokens in Figma and synced with React code via GitHub Actions.",
            ],
          },
        ],
      },
      {
        id: "block-skills-2",
        type: "skills",
        title: "Skills",
        groups: [
          {
            name: "Design & UX",
            level: "Expert",
            keywords: [
              "Figma",
              "UI/UX",
              "Design Systems",
              "Prototyping",
              "User Research",
            ],
          },
          {
            name: "Front-End",
            level: "Advanced",
            keywords: ["HTML/CSS", "React", "Tailwind CSS", "Framer Motion"],
          },
        ],
      },
    ],
  },
];

export const DEMO_JOBS = [
  {
    _id: "job-1",
    id: "job-1",
    company: "Google",
    position: "Senior Frontend Engineer",
    status: "Interviewing",
    location: "Mountain View, CA (Hybrid)",
    salary: "$195,000 - $230,000",
    url: "https://careers.google.com",
    notes:
      "System design round scheduled for next Tuesday. Review distributed caching and state management.",
    dateSaved: "2026-09-02",
    dateApplied: "2026-09-08",
  },
  {
    _id: "job-2",
    id: "job-2",
    company: "Stripe",
    position: "Full Stack Engineer (Payments)",
    status: "Offer",
    location: "San Francisco, CA (Hybrid)",
    salary: "$210,000 - $240,000",
    url: "https://stripe.com/jobs",
    notes:
      "Official offer letter received! Great equity grant and 401(k) match.",
    dateSaved: "2026-08-20",
    dateApplied: "2026-08-24",
  },
  {
    _id: "job-3",
    id: "job-3",
    company: "Vercel",
    position: "Developer Experience Engineer",
    status: "Interviewing",
    location: "Remote (Global)",
    salary: "$180,000 - $215,000",
    url: "https://vercel.com/careers",
    notes:
      "Completed take-home challenge with React 19 and Next.js App Router.",
    dateSaved: "2026-09-05",
    dateApplied: "2026-09-10",
  },
  {
    _id: "job-4",
    id: "job-4",
    company: "Linear",
    position: "Product Engineer",
    status: "Applied",
    location: "Remote (US)",
    salary: "$175,000 - $200,000",
    url: "https://linear.app/careers",
    notes: "Applied with customized portfolio and referral from tech lead.",
    dateSaved: "2026-09-12",
    dateApplied: "2026-09-14",
  },
  {
    _id: "job-5",
    id: "job-5",
    company: "Airbnb",
    position: "Senior UI Systems Engineer",
    status: "Saved",
    location: "San Francisco, CA",
    salary: "$185,000 - $215,000",
    url: "https://careers.airbnb.com",
    notes: "Revising resume to highlight design system token synchronization.",
    dateSaved: "2026-09-15",
    dateApplied: "",
  },
];

export const DEMO_STATS = {
  jobsAdded: 14,
  conversionRate: 72,
  interviewRate: 40,
  activeApplications: 8,
  totalResumes: 2,
};

// Realistic mock responses for AI actions
export function generateMockAiResponse(payload = {}) {
  const prompt = (
    payload.prompt ||
    payload.text ||
    payload.content ||
    ""
  ).toLowerCase();
  const action = payload.action || payload.type || "";

  // Summary generation or improvement
  if (
    action.includes("summary") ||
    prompt.includes("summary") ||
    prompt.includes("bio") ||
    prompt.includes("professional")
  ) {
    return {
      success: true,
      text: "Accomplished Senior Software Engineer with 6+ years of specialized experience architecting scalable distributed systems and high-converting web applications. Proven track record of accelerating page load times by 40%, mentoring cross-functional engineering teams, and leading end-to-end product delivery in fast-paced agile environments.",
      result:
        "Accomplished Senior Software Engineer with 6+ years of specialized experience architecting scalable distributed systems and high-converting web applications. Proven track record of accelerating page load times by 40%, mentoring cross-functional engineering teams, and leading end-to-end product delivery in fast-paced agile environments.",
      summary:
        "Accomplished Senior Software Engineer with 6+ years of specialized experience architecting scalable distributed systems and high-converting web applications. Proven track record of accelerating page load times by 40%, mentoring cross-functional engineering teams, and leading end-to-end product delivery in fast-paced agile environments.",
    };
  }

  // Bullet point generation or enhancement
  if (
    action.includes("bullet") ||
    prompt.includes("bullet") ||
    prompt.includes("experience") ||
    prompt.includes("highlight")
  ) {
    const bullets = [
      "• Spearheaded architecture modernization to React and TypeScript, driving a 38% increase in application performance and reducing regression bugs by 45%.",
      "• Architected resilient microservices and distributed caching layer handling 15M+ daily requests with 99.99% system availability.",
      "• Mentored 8 junior and mid-level software engineers, fostering best practices in automated testing and CI/CD deployment pipelines.",
    ];
    return {
      success: true,
      text: bullets.join("\n"),
      result: bullets.join("\n"),
      bullets,
    };
  }

  // ATS Check / Scoring
  if (
    action.includes("ats") ||
    prompt.includes("ats") ||
    prompt.includes("score") ||
    payload.resumeData
  ) {
    return {
      success: true,
      score: 95,
      rating: "Top 5% - Exceptional",
      feedback: {
        strengths: [
          "100% ATS-compliant single-column layout without unparsed tables or graphical text.",
          "Strong action verbs (Architected, Spearheaded, Mentored, Optimized) start each bullet point.",
          "Clear quantifiable impact and metrics included throughout work experience.",
          "Industry standard section headers and verified contact profiles.",
        ],
        improvements: [
          "Optional: Add 1-2 additional cloud certification credentials if targeting AWS/GCP DevOps roles.",
        ],
      },
    };
  }

  // Resume tailoring
  if (
    action.includes("tailor") ||
    prompt.includes("tailor") ||
    prompt.includes("job")
  ) {
    return {
      success: true,
      matchRate: 94,
      tailoredSkills: [
        "React 19",
        "TypeScript",
        "Distributed Systems",
        "Tailwind CSS",
        "GraphQL",
      ],
      suggestions: [
        "Emphasize high-volume transaction handling in your first work experience block.",
        "Include metrics regarding automated testing and code review throughput.",
      ],
    };
  }

  // Default smart AI assistant response
  return {
    success: true,
    text: "Here is your AI-optimized recommendation tailored for high ATS visibility: Focused on measurable impact, verified technical keywords, and clear action-oriented phrasing.",
    result:
      "Engineered high-performance web applications leveraging modern React and cloud infrastructure, improving response times by 35% and elevating user retention across enterprise accounts.",
  };
}
