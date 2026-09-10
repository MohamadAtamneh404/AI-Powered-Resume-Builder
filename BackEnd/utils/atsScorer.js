/**
 * Genuine ATS Scoring Engine
 * Analyzes resume data against real ATS parser and recruiter criteria.
 */

const ACTION_VERBS = new Set([
  "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered", "advanced",
  "advised", "advocated", "aligned", "allocated", "analyzed", "appraised", "architected",
  "assembled", "assessed", "audited", "automated", "authored", "balanced", "boosted",
  "briefed", "budgeted", "built", "calculated", "calibrated", "capitalized", "centralized",
  "championed", "clarified", "classified", "coached", "collaborated", "collected", "commissioned",
  "communicated", "compiled", "composed", "computed", "conceived", "conducted", "configured",
  "consolidated", "constructed", "consulted", "controlled", "converted", "coordinated", "counseled",
  "created", "cultivated", "customized", "debugged", "decreased", "defined", "delegated",
  "delivered", "demonstrated", "deployed", "designed", "detailed", "determined", "developed",
  "devised", "diagnosed", "directed", "discovered", "dispatched", "distributed", "diversified",
  "documented", "drafted", "drove", "earned", "edited", "educated", "eliminated",
  "enabled", "engineered", "enhanced", "enlarged", "established", "estimated", "evaluated",
  "examined", "executed", "expanded", "expedited", "experimented", "explained", "explored",
  "facilitated", "finalized", "financed", "focused", "forecasted", "formulated", "fostered",
  "founded", "fulfilled", "gained", "gathered", "generated", "governed", "guided",
  "handled", "headed", "hired", "identified", "illustrated", "implemented", "improved",
  "improvised", "increased", "indexed", "influenced", "initiated", "innovated", "inspected",
  "inspired", "installed", "instituted", "instructed", "integrated", "intensified", "interpreted",
  "interviewed", "introduced", "invented", "investigated", "isolated", "issued", "launched",
  "lead", "led", "leveraged", "liaised", "licensed", "located", "maintained",
  "managed", "mapped", "marketed", "maximized", "measured", "mediated", "mentored",
  "merged", "migrated", "minimized", "mobilized", "modeled", "moderated", "modernized",
  "modified", "monitored", "motivated", "navigated", "negotiated", "networked", "neutralized",
  "obtained", "operated", "optimized", "orchestrated", "organized", "originated", "outperformed",
  "overhauled", "oversaw", "partnered", "performed", "pioneered", "planned", "positioned",
  "predicted", "prepared", "presented", "prevented", "prioritized", "produced", "programmed",
  "promoted", "proposed", "protected", "proved", "provided", "published", "purchased",
  "qualified", "quantified", "queried", "raised", "ran", "reached", "realigned",
  "rebuilt", "received", "recognized", "recommended", "reconciled", "recorded", "recruited",
  "redesigned", "reduced", "refactored", "refined", "reformed", "regained", "regulated",
  "rehabilitated", "reinforced", "rejuvenated", "renegotiated", "reorganized", "repaired", "replaced",
  "replanned", "reported", "represented", "researched", "resolved", "restored", "restructured",
  "retrieved", "revamped", "reviewed", "revised", "revitalized", "rewarded", "routed",
  "saved", "scaled", "scheduled", "screened", "secured", "selected", "separated",
  "served", "shaped", "simplified", "simulated", "solved", "spearheaded", "specialized",
  "specified", "standardized", "started", "stimulated", "streamlined", "strengthened", "structured",
  "supervised", "supported", "surpassed", "surveyed", "synthesized", "systematized", "targeted",
  "taught", "tested", "tracked", "trained", "transformed", "translated", "tripled",
  "troubleshot", "unified", "upgraded", "utilized", "validated", "verified", "visualized", "won"
]);

const METRIC_PATTERN = /(?:\$|€|£)?\b\d+(?:[\.,]\d+)?\s*(?:%|k|m|b|x|\+|users|clients|customers|requests|transactions|ms|seconds|minutes|hours|days|weeks|months|years|members|teams|projects|dollars)?\b/i;

function calculateAtsScore(resume) {
  if (!resume) return { score: 0, breakdown: {} };

  const data = resume.resumeData || resume || {};
  const basics = data.personalInfo || data.basics || resume.basics || {};
  const work = data.experience || data.work || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const summary = basics.summary || (resume.blocks && resume.blocks.find((b) => b.type === "summary")?.content) || "";

  // 1. Contact Info (20 pts)
  let contactScore = 0;
  if (basics.name && !/your name/i.test(basics.name)) contactScore += 5;
  if (basics.email && basics.email.includes("@")) contactScore += 5;
  if (basics.phone && String(basics.phone).replace(/\D/g, "").length >= 7) contactScore += 4;
  if (basics.location && (typeof basics.location === "string" ? basics.location.trim() : basics.location?.city)) contactScore += 3;
  if (basics.website || basics.url || basics.linkedin || basics.github || (basics.profiles && basics.profiles.length > 0)) contactScore += 3;

  // 2. Sections Completeness (20 pts)
  let sectionScore = 0;
  const wordCount = summary.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 15) sectionScore += 5;
  else if (wordCount > 0) sectionScore += 2;

  if (Array.isArray(work) && work.length > 0) {
    const validRoles = work.filter((w) => w.title || w.position || w.company);
    if (validRoles.length >= 2) sectionScore += 6;
    else if (validRoles.length === 1) sectionScore += 4;
  }

  if (Array.isArray(education) && education.length > 0) {
    const validEdu = education.filter((e) => e.institution || e.degree || e.studyType);
    if (validEdu.length >= 1) sectionScore += 5;
  }

  if (skills.length >= 5) sectionScore += 4;
  else if (skills.length > 0) sectionScore += 2;

  // 3. Impact & Quantifiable Metrics (25 pts)
  let allBullets = [];
  if (Array.isArray(work)) {
    work.forEach((w) => {
      if (Array.isArray(w.description)) {
        allBullets.push(...w.description);
      } else if (typeof w.description === "string") {
        allBullets.push(...w.description.split("\n"));
      }
      if (Array.isArray(w.highlights)) {
        allBullets.push(...w.highlights);
      }
    });
  }
  allBullets = allBullets.map((b) => (typeof b === "string" ? b.trim() : "")).filter(Boolean);

  let metricBulletsCount = 0;
  let actionVerbBulletsCount = 0;

  allBullets.forEach((bullet) => {
    if (METRIC_PATTERN.test(bullet)) {
      metricBulletsCount++;
    }
    const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && ACTION_VERBS.has(firstWord)) {
      actionVerbBulletsCount++;
    }
  });

  let impactScore = 5;
  if (metricBulletsCount >= 4) impactScore = 25;
  else if (metricBulletsCount === 3) impactScore = 20;
  else if (metricBulletsCount === 2) impactScore = 15;
  else if (metricBulletsCount === 1) impactScore = 10;

  // 4. Action Verbs (20 pts)
  let verbScore = 5;
  const totalBullets = allBullets.length || 1;
  const verbRatio = actionVerbBulletsCount / totalBullets;

  if (verbRatio >= 0.7 && actionVerbBulletsCount >= 3) verbScore = 20;
  else if (verbRatio >= 0.5 && actionVerbBulletsCount >= 2) verbScore = 15;
  else if (verbRatio >= 0.3 || actionVerbBulletsCount >= 1) verbScore = 10;

  // 5. Skills Breadth & Technical Keywords (15 pts)
  let skillScore = 0;
  const skillCount = skills.length;
  if (skillCount >= 12) skillScore = 15;
  else if (skillCount >= 8) skillScore = 12;
  else if (skillCount >= 5) skillScore = 9;
  else if (skillCount >= 1) skillScore = 5;

  let totalScore = contactScore + sectionScore + impactScore + verbScore + skillScore;

  // Penalty for placeholder text
  const resumeJsonString = JSON.stringify(data);
  const hasPlaceholders = /jane\.doe|john\.doe|email@example\.com|\+1 234 567|your name/i.test(resumeJsonString);
  if (hasPlaceholders) {
    totalScore = Math.max(30, totalScore - 12);
  }

  totalScore = Math.min(99, Math.max(20, Math.round(totalScore)));

  // Detailed Diagnostics: What is Good vs What Needs Improvement
  const goodParts = [];
  const badParts = [];

  // 1. Contact Info Audit
  if (contactScore >= 18) {
    goodParts.push({
      id: "contact",
      title: "Complete Contact Information",
      description: "Name, email, phone, location, and professional links are fully populated and parse-safe.",
      points: contactScore,
      maxPoints: 20,
    });
  } else {
    if (!basics.email || !basics.email.includes("@")) {
      badParts.push({
        id: "email",
        title: "Missing or Invalid Email",
        issue: "No valid email address found in the contact section.",
        suggestion: "Add your direct personal or professional email for recruiter outreach.",
        fixScope: "header",
        actionLabel: "Fix Contact Info",
        pointsLost: 5,
      });
    }
    if (!basics.phone || String(basics.phone).replace(/\D/g, "").length < 7) {
      badParts.push({
        id: "phone",
        title: "Missing Phone Number",
        issue: "No contact phone number provided.",
        suggestion: "Add a direct phone number with area/country code.",
        fixScope: "header",
        actionLabel: "Fix Contact Info",
        pointsLost: 4,
      });
    }
    if (!basics.location) {
      badParts.push({
        id: "location",
        title: "Missing Location / City",
        issue: "City and region are omitted.",
        suggestion: "Add your current city and country to pass geographic ATS search filters.",
        fixScope: "header",
        actionLabel: "Fix Contact Info",
        pointsLost: 3,
      });
    }
    if (!basics.website && !basics.url && !basics.linkedin && !basics.github && (!basics.profiles || basics.profiles.length === 0)) {
      badParts.push({
        id: "links",
        title: "Missing LinkedIn or GitHub Profile",
        issue: "No professional portfolio or LinkedIn URL detected.",
        suggestion: "Add your LinkedIn or GitHub profile to elevate candidate credibility.",
        fixScope: "header",
        actionLabel: "Add LinkedIn / GitHub",
        pointsLost: 3,
      });
    }
  }

  // 2. Summary Audit
  if (wordCount >= 15) {
    goodParts.push({
      id: "summary",
      title: "Strong Professional Summary",
      description: `${wordCount} words providing a clear value proposition and role positioning.`,
      points: 5,
      maxPoints: 5,
    });
  } else {
    badParts.push({
      id: "summary",
      title: wordCount === 0 ? "Missing Professional Summary" : "Summary Too Brief",
      issue: wordCount === 0 ? "No summary section found." : `Summary is only ${wordCount} words (minimum 15 recommended).`,
      suggestion: "Add a 2–3 sentence executive summary highlighting your core skills, years of experience, and primary domain expertise.",
      fixScope: "summary",
      actionLabel: "Generate Summary with AI",
      pointsLost: 5,
    });
  }

  // 3. Work Experience Audit
  const validRoles = Array.isArray(work) ? work.filter((w) => w.title || w.position || w.company) : [];
  if (validRoles.length >= 2) {
    goodParts.push({
      id: "work",
      title: "Documented Work Experience",
      description: `${validRoles.length} work positions documented with clear job titles and employers.`,
      points: 6,
      maxPoints: 6,
    });
  } else {
    badParts.push({
      id: "work",
      title: "Limited Work History",
      issue: validRoles.length === 0 ? "No work experience entries added." : "Only 1 work experience entry found.",
      suggestion: "Include at least 2 relevant roles, internships, or freelance projects.",
      fixScope: "work",
      actionLabel: "Add Experience Role",
      pointsLost: 4,
    });
  }

  // 4. Education Audit
  const validEdu = Array.isArray(education) ? education.filter((e) => e.institution || e.degree || e.studyType) : [];
  if (validEdu.length >= 1) {
    goodParts.push({
      id: "education",
      title: "Education Credentials Present",
      description: "Academic or professional study background clearly listed.",
      points: 5,
      maxPoints: 5,
    });
  } else {
    badParts.push({
      id: "education",
      title: "Missing Education Section",
      issue: "No academic degrees, diplomas, or bootcamp qualifications found.",
      suggestion: "Add your college degree, high school, or certification program.",
      fixScope: "education",
      actionLabel: "Add Education",
      pointsLost: 5,
    });
  }

  // 5. Quantifiable Impact & Metrics Audit
  if (metricBulletsCount >= 3) {
    goodParts.push({
      id: "metrics",
      title: "Quantifiable Impact & Metrics",
      description: `${metricBulletsCount} bullet points feature measurable metrics (%, $, numbers, or multipliers).`,
      points: impactScore,
      maxPoints: 25,
    });
  } else {
    badParts.push({
      id: "metrics",
      title: "Missing Measurable Numbers & Metrics",
      issue: `Only ${metricBulletsCount} bullet point(s) contain numbers or percentages. ATS algorithms rank quantified results significantly higher.`,
      suggestion: "Enrich your work bullets with quantifiable outcomes: % growth, revenue figures, time saved, or team sizes.",
      fixScope: "work",
      actionLabel: "Enrich Bullets with AI",
      pointsLost: 25 - impactScore,
    });
  }

  // 6. Action Verbs Audit
  if (actionVerbBulletsCount >= 2 && verbRatio >= 0.4) {
    goodParts.push({
      id: "verbs",
      title: "Action-Oriented Phrasing",
      description: `${actionVerbBulletsCount} bullets start with high-impact power verbs.`,
      points: verbScore,
      maxPoints: 20,
    });
  } else {
    badParts.push({
      id: "verbs",
      title: "Passive Language in Bullet Points",
      issue: "Few bullets begin with strong action verbs (e.g., spearheaded, architected, engineered, increased).",
      suggestion: "Start each accomplishment bullet with a strong past-tense action verb.",
      fixScope: "work",
      actionLabel: "Strengthen Verbs with AI",
      pointsLost: 20 - verbScore,
    });
  }

  // 7. Skills Breadth Audit
  if (skillCount >= 8) {
    goodParts.push({
      id: "skills",
      title: "Broad Technical & Domain Skills",
      description: `${skillCount} skills listed across relevant categories.`,
      points: skillScore,
      maxPoints: 15,
    });
  } else {
    badParts.push({
      id: "skills",
      title: "Insufficient Keyword Density",
      issue: `Only ${skillCount} skills detected. Most ATS filters require 8–15 relevant skills.`,
      suggestion: "Add technical competencies, programming tools, methodologies, and platforms.",
      fixScope: "skills",
      actionLabel: "Suggest Skills with AI",
      pointsLost: 15 - skillScore,
    });
  }

  // 8. Placeholder Penalty Audit
  if (hasPlaceholders) {
    badParts.push({
      id: "placeholders",
      title: "Template Placeholder Data Detected",
      issue: "Found dummy placeholder data like 'jane.doe@example.com' or 'Your Name'.",
      suggestion: "Replace all sample template placeholder values with your actual candidate credentials.",
      fixScope: "header",
      actionLabel: "Clear Sample Data",
      pointsLost: 12,
    });
  }

  return {
    score: totalScore,
    breakdown: {
      contactScore,
      sectionScore,
      impactScore,
      verbScore,
      skillScore,
      metricBulletsCount,
      actionVerbBulletsCount,
      skillCount,
    },
    goodParts,
    badParts,
  };
}

module.exports = {
  calculateAtsScore,
};
