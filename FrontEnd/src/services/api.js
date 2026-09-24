import axios from "axios";
import { auth } from "./firebase";
import {
  DEMO_USER,
  DEMO_TEMPLATES,
  DEMO_RESUMES,
  DEMO_JOBS,
  DEMO_STATS,
  generateMockAiResponse,
} from "./mockData";

// Preview / Demo mode is enabled by default so the UI works 100% standalone
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

// Helper for simulated network latency
const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredResumes() {
  const data = localStorage.getItem("demo_resumes");
  if (!data) {
    localStorage.setItem("demo_resumes", JSON.stringify(DEMO_RESUMES));
    localStorage.setItem("resume_drafts", JSON.stringify(DEMO_RESUMES));
    return [...DEMO_RESUMES];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [...DEMO_RESUMES];
  }
}

function saveStoredResumes(resumes) {
  localStorage.setItem("demo_resumes", JSON.stringify(resumes));
  localStorage.setItem("resume_drafts", JSON.stringify(resumes));
}

function getStoredJobs() {
  const data = localStorage.getItem("demo_jobs");
  if (!data) {
    localStorage.setItem("demo_jobs", JSON.stringify(DEMO_JOBS));
    return [...DEMO_JOBS];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [...DEMO_JOBS];
  }
}

function saveStoredJobs(jobs) {
  localStorage.setItem("demo_jobs", JSON.stringify(jobs));
}

// Standalone Mock Adapter for Client Showcase
async function mockAdapter(config) {
  const method = (config.method || "get").toLowerCase();
  let url = config.url || "";

  // Strip baseURL if included
  if (url.startsWith("/api")) {
    url = url.replace(/^\/api/, "");
  }
  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  // Parse payload
  let payload = {};
  if (config.data) {
    try {
      payload =
        typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      payload = config.data;
    }
  }

  // Handle AI Requests
  if (url.startsWith("/ai") || url.startsWith("/tailor")) {
    await sleep(400); // realistic AI thinking animation delay
    const mockAiData = generateMockAiResponse(payload);
    return {
      data: mockAiData,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // Quick simulated network delay for CRUD
  await sleep(80);

  // 1. Templates
  if (url === "/templates" && method === "get") {
    return {
      data: DEMO_TEMPLATES,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/templates/") && method === "get") {
    const templateId = url.replace("/templates/", "");
    const found =
      DEMO_TEMPLATES.find((t) => t.id === templateId || t._id === templateId) ||
      DEMO_TEMPLATES[0];
    return {
      data: found,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // 2. User info & settings
  if ((url === "/users/me" || url === "/user/me") && method === "get") {
    const storedUser = localStorage.getItem("demo_user");
    const userObj = storedUser ? JSON.parse(storedUser) : DEMO_USER;
    return {
      data: userObj,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (
    (url === "/user/career-profile" || url === "/settings") &&
    (method === "put" || method === "post")
  ) {
    const storedUser = localStorage.getItem("demo_user");
    const userObj = storedUser ? JSON.parse(storedUser) : { ...DEMO_USER };
    const updated = { ...userObj, ...payload };
    localStorage.setItem("demo_user", JSON.stringify(updated));
    return {
      data: updated,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // 3. Resumes CRUD
  if (url === "/resumes" && method === "get") {
    const resumes = getStoredResumes();
    return {
      data: resumes,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url === "/resumes" && method === "post") {
    const resumes = getStoredResumes();
    const newResume = {
      _id: "demo-resume-" + Date.now(),
      id: "demo-resume-" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    resumes.unshift(newResume);
    saveStoredResumes(resumes);
    return {
      data: newResume,
      status: 201,
      statusText: "Created",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url === "/resumes/export-pdf" && method === "post") {
    if (typeof window !== "undefined") {
      setTimeout(() => window.print(), 300);
    }
    return {
      data: { success: true, message: "PDF print dialog opened" },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/resumes/") && method === "get") {
    const id = decodeURIComponent(url.replace("/resumes/", ""));
    const resumes = getStoredResumes();
    const found =
      resumes.find((r) => String(r.id || r._id) === String(id)) || resumes[0];
    return {
      data: found,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/resumes/") && (method === "put" || method === "patch")) {
    const id = decodeURIComponent(url.replace("/resumes/", ""));
    const resumes = getStoredResumes();
    const index = resumes.findIndex(
      (r) => String(r.id || r._id) === String(id),
    );
    let updated;
    if (index >= 0) {
      updated = {
        ...resumes[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      resumes[index] = updated;
    } else {
      updated = {
        _id: id,
        id: id,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      resumes.unshift(updated);
    }
    saveStoredResumes(resumes);
    return {
      data: updated,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/resumes/") && method === "delete") {
    const id = decodeURIComponent(url.replace("/resumes/", ""));
    const resumes = getStoredResumes().filter(
      (r) => String(r.id || r._id) !== String(id),
    );
    saveStoredResumes(resumes);
    return {
      data: { success: true, message: "Resume deleted" },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // 4. Job Applications Tracker CRUD
  if (url === "/jobs" && method === "get") {
    const jobs = getStoredJobs();
    return {
      data: jobs,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url === "/jobs" && method === "post") {
    const jobs = getStoredJobs();
    const newJob = {
      _id: "job-" + Date.now(),
      id: "job-" + Date.now(),
      dateSaved: new Date().toISOString().split("T")[0],
      ...payload,
    };
    jobs.unshift(newJob);
    saveStoredJobs(jobs);
    return {
      data: newJob,
      status: 201,
      statusText: "Created",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/jobs/") && (method === "put" || method === "patch")) {
    const id = decodeURIComponent(url.replace("/jobs/", ""));
    const jobs = getStoredJobs();
    const index = jobs.findIndex((j) => String(j.id || j._id) === String(id));
    let updated;
    if (index >= 0) {
      updated = { ...jobs[index], ...payload };
      jobs[index] = updated;
    } else {
      updated = { _id: id, id: id, ...payload };
      jobs.unshift(updated);
    }
    saveStoredJobs(jobs);
    return {
      data: updated,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  if (url.startsWith("/jobs/") && method === "delete") {
    const id = decodeURIComponent(url.replace("/jobs/", ""));
    const jobs = getStoredJobs().filter(
      (j) => String(j.id || j._id) !== String(id),
    );
    saveStoredJobs(jobs);
    return {
      data: { success: true, message: "Job application deleted" },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // 5. Analytics
  if (url.startsWith("/analytics") && method === "get") {
    const jobs = getStoredJobs();
    const resumes = getStoredResumes();
    return {
      data: {
        ...DEMO_STATS,
        jobsAdded: jobs.length,
        totalResumes: resumes.length,
      },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
    };
  }

  // Default catch-all mock response
  return {
    data: { success: true, message: "OK (Preview Mode)" },
    status: 200,
    statusText: "OK",
    headers: { "content-type": "application/json" },
    config,
  };
}

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  ...(IS_DEMO_MODE ? { adapter: mockAdapter } : {}),
});

// Intercept requests to attach Authorization token if user is signed in
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token") || "demo-token";
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
        localStorage.setItem("token", token);
      } catch {
        // use existing cached token
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
