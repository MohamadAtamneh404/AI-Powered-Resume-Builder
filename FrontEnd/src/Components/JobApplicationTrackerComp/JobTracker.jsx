// src/Components/JobApplicationTrackerComp/JobTracker.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import api from "../../services/api";
import { UserContext } from "../../Context/UserContext";
import JobModal from "./JobModal";
import ColumnSelector from "./ColumnSelector";
import { exportToExcel } from "../../Utility/exportToExcel";

// Create an Axios instance with default config

// Add request interceptor to attach token automatically

// All possible columns
const ALL_COLUMNS = [
  { key: "position", label: "Position", visible: true },
  { key: "company", label: "Company", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "dateSaved", label: "Date Saved", visible: true },
  { key: "dateApplied", label: "Date Applied", visible: true },
  { key: "url", label: "URL", visible: true },
  { key: "location", label: "Location", visible: false },
  { key: "salary", label: "Salary", visible: false },
  { key: "notes", label: "Notes", visible: true },
];

export default function JobTracker() {
  const { user } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [stats, setStats] = useState({ jobsAdded: 0, conversionRate: 0 });
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter((col) => col.visible).map((col) => col.key),
  );
  const [editingJob, setEditingJob] = useState(null);
  const [apiError, setApiError] = useState("");

  // Inline editing state
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editingValue, setEditingValue] = useState("");

  const Spinner = () => (
    <div className="flex justify-center items-center py-12">
      <svg
        className="animate-spin h-8 w-8 text-[#9fff00]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );

  // Keep columns ordered as in ALL_COLUMNS
  const columnsToRender = useMemo(() => {
    const set = new Set(visibleColumns);
    return ALL_COLUMNS.filter((c) => set.has(c.key));
  }, [visibleColumns]);

  const fieldKeyMap = {
    position: "position",
    company: "company",
    status: "status",
    dateApplied: "dateApplied",
    url: "jobLink",
    location: "location",
    salary: "salary",
    notes: "notes",
  };

  const beginEdit = (job, field) => {
    let currentVal = "";
    if (field === "dateApplied") {
      currentVal = job.dateApplied
        ? new Date(job.dateApplied).toISOString().split("T")[0]
        : "";
    } else if (field === "url") {
      currentVal = job.jobLink || "";
    } else {
      currentVal = job[field] ?? "";
    }
    setEditingCell({ id: job._id, field });
    setEditingValue(String(currentVal));
  };

  const cancelEdit = () => {
    setEditingCell({ id: null, field: null });
    setEditingValue("");
  };

  const updateJobField = async (jobId, field, value) => {
    try {
      const key = fieldKeyMap[field];
      if (!key) return;
      const payload = { [key]: value };
      await api.put(`/jobs/${jobId}`, payload);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, [key]: value } : j)),
      );
    } catch (err) {
      setApiError("Update failed. Please try again.");
      console.error("Inline update error:", err);
    }
  };

  const commitEdit = async () => {
    const { id, field } = editingCell;
    if (!id || !field) return;
    let value = editingValue;
    if (field === "dateApplied") {
      value = value || null;
    }
    await updateJobField(id, field, value);
    cancelEdit();
  };

  const handleEditKeyDown = async (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === "Enter") {
      if (editingCell.field === "notes") {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          await commitEdit();
        }
      } else {
        e.preventDefault();
        await commitEdit();
      }
    }
  };

  // Derived stats
  const conversionRate = useMemo(() => {
    const total = jobs.filter((job) => !job.archived).length;
    const interviews = jobs.filter(
      (job) => !job.archived && job.status === "Interview",
    ).length;
    return total > 0 ? Math.round((interviews / total) * 100) : 0;
  }, [jobs]);

  const activeCount = useMemo(
    () => jobs.filter((j) => !j.archived).length,
    [jobs],
  );
  const archivedCount = useMemo(
    () => jobs.filter((j) => j.archived).length,
    [jobs],
  );

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedJobs([]);
  }, [showArchived]);

  const fetchData = async () => {
    try {
      setApiError("");
      const [jobsRes, statsRes] = await Promise.all([
        api.get("/jobs"),
        api.get("/jobs/stats"),
      ]);
      setJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setApiError("Failed to fetch jobs. Please try again.");
      console.error("Failed to fetch data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection
  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((job) => job._id));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    try {
      await api.post("/jobs/bulk", { action, jobIds: selectedJobs });
      setSelectedJobs([]);
      fetchData();
    } catch (err) {
      setApiError("Bulk action failed.");
      console.error("Bulk action error:", err);
    }
  };

  // Single actions
  const handleArchive = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/archive`);
      fetchData();
    } catch (err) {
      setApiError("Archive failed.");
      console.error("Archive error:", err);
    }
  };

  const handleUnarchive = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}`, { archived: false });
      fetchData();
    } catch (err) {
      setApiError("Restore failed.");
      console.error("Unarchive error:", err);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchData();
    } catch (err) {
      setApiError("Delete failed.");
      console.error("Delete error:", err);
    }
  };

  // Blur buttons on release to avoid sticky hover/focus visuals
  const releaseBlur = (e) => {
    try {
      e.currentTarget && e.currentTarget.blur && e.currentTarget.blur();
    } catch {
      // Ignore blur failure on unmounted elements
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredJobs.map((job) => ({
      Position: job.position,
      Company: job.company,
      Status: job.status,
      "Date Saved": new Date(job.createdAt).toLocaleDateString(),
      "Date Applied": job.dateApplied
        ? new Date(job.dateApplied).toLocaleDateString()
        : "",
      URL: job.jobLink || "",
      Location: job.location || "",
      Salary: job.salary || "",
      Notes: job.notes || "",
    }));
    exportToExcel(exportData, "Job_Applications");
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.position.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || job.status === filterStatus;
      const matchesArchived = showArchived ? job.archived : !job.archived;
      return matchesSearch && matchesStatus && matchesArchived;
    });
  }, [jobs, search, filterStatus, showArchived]);

  if (loading) return <Spinner />;

  const StatCard = ({ icon, label, value, accent }) => (
    <div className="flex items-center gap-3.5 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition">
      <div
        className={`h-10 w-10 grid place-items-center rounded-xl ${accent} text-[#1a1a1a] dark:text-zinc-100`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-[#8e8e8e] dark:text-zinc-400 font-mono uppercase tracking-wider">
          {label}
        </div>
        <div className="font-['Outfit'] text-2xl font-bold text-[#1a1a1a] dark:text-zinc-100">
          {value}
        </div>
      </div>
    </div>
  );

  const renderCell = (job, colKey) => {
    const isEditing =
      editingCell.id === job._id && editingCell.field === colKey;
    switch (colKey) {
      case "position":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "position")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="font-medium text-[#1a1a1a] dark:text-zinc-100">
                {job.position}
              </span>
            )}
          </td>
        );
      case "company":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "company")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="font-semibold text-[#1a1a1a] dark:text-zinc-100">
                {job.company}
              </span>
            )}
          </td>
        );
      case "status":
        return (
          <td className="px-4 py-3">
            <select
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-full text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#9fff00] shadow-2xs"
              value={job.status}
              onChange={(e) =>
                updateJobField(job._id, "status", e.target.value)
              }
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
            </select>
          </td>
        );
      case "dateSaved":
        return (
          <td className="px-4 py-3 text-sm text-gray-400">
            {new Date(job.createdAt).toLocaleDateString()}
          </td>
        );
      case "dateApplied":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "dateApplied")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                type="date"
                autoFocus
                className="px-2 py-1 bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#9fff00] text-xs shadow-2xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">
                {job.dateApplied
                  ? new Date(job.dateApplied).toLocaleDateString()
                  : "-"}
              </span>
            )}
          </td>
        );
      case "url":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "url")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                placeholder="https://..."
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : job.jobLink ? (
              <a
                href={job.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9fff00] hover:text-[#9fff00] underline text-sm"
              >
                Open
              </a>
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </td>
        );
      case "location":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "location")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">
                {job.location || "-"}
              </span>
            )}
          </td>
        );
      case "salary":
        return (
          <td
            className="px-4 py-3"
            onDoubleClick={() => beginEdit(job, "salary")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">
                {job.salary || "-"}
              </span>
            )}
          </td>
        );
      case "notes":
        return (
          <td
            className="px-4 py-3 text-sm align-top"
            onDoubleClick={() => beginEdit(job, "notes")}
            title="Double-click to edit"
          >
            {isEditing ? (
              <textarea
                autoFocus
                rows={3}
                className="w-full p-2 bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-[#1a1a1a] dark:text-zinc-100 outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 text-xs"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="block max-w-xs truncate text-[#8e8e8e] dark:text-zinc-400">
                {job.notes || "-"}
              </span>
            )}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative pt-6 pb-10 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Decorative background gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-black/[0.02] to-transparent blur-2xl" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-zinc-100 tracking-tight">
              Job Applications
            </h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-400">
              Track your applications, update statuses, and stay organized with
              a clean overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedJobs.length > 0 && (
              <div className="flex gap-2">
                {!showArchived && (
                  <button
                    onClick={() => handleBulkAction("archive")}
                    onMouseUp={releaseBlur}
                    onMouseLeave={releaseBlur}
                    onTouchEnd={releaseBlur}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 bg-gray-700 hover:bg-gray-600 border border-white/10 shadow"
                  >
                    Archive ({selectedJobs.length})
                  </button>
                )}
                <button
                  onClick={() => handleBulkAction("delete")}
                  onMouseUp={releaseBlur}
                  onMouseLeave={releaseBlur}
                  onTouchEnd={releaseBlur}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 bg-red-700 hover:bg-red-600 border border-white/10 shadow"
                >
                  Delete ({selectedJobs.length})
                </button>
              </div>
            )}
            <button
              onClick={handleExport}
              onMouseUp={releaseBlur}
              onMouseLeave={releaseBlur}
              onTouchEnd={releaseBlur}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#9fff00] border border-[#9fff00]/40 bg-[#9fff00]/10 hover:bg-[#9fff00]/20 shadow"
            >
              ⬇️ Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              onMouseUp={releaseBlur}
              onMouseLeave={releaseBlur}
              onTouchEnd={releaseBlur}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#1a1a1a] bg-[#9fff00] hover:bg-[#8fee00] shadow"
            >
              ➕ New Job
            </button>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 flex justify-between items-center">
          <span>{apiError}</span>
          <button
            onClick={() => setApiError("")}
            className="text-red-500 hover:text-red-300"
          >
            ✖
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="📁"
          label="Jobs added (7d)"
          value={stats.jobsAdded}
          accent="bg-[#9fff00]/20"
        />
        <StatCard
          icon="📈"
          label="Applications → Interview"
          value={`${conversionRate}%`}
          accent="bg-teal-500/20"
        />
        <button
          onClick={() => setShowArchived((prev) => !prev)}
          onMouseUp={releaseBlur}
          onMouseLeave={releaseBlur}
          onTouchEnd={releaseBlur}
          className={`text-left ${showArchived ? "ring-2 ring-[#9fff00]" : ""} rounded-2xl transition`}
        >
          <div className="flex items-center gap-3.5 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              🗂️
            </div>
            <div>
              <div className="text-xs text-[#8e8e8e] dark:text-zinc-400 font-mono uppercase tracking-wider">
                {showArchived ? "Viewing" : "Switch to"} Archived
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="text-[#1a1a1a] dark:text-zinc-100 font-bold">
                  {archivedCount}
                </span>{" "}
                archived •{" "}
                <span className="text-[#1a1a1a] dark:text-zinc-100 font-bold">{activeCount}</span>{" "}
                active
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search positions or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#9fff00] shadow-xs text-sm"
          />
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/10 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#9fff00] text-sm shadow-xs"
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted">Ghosted</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowColumnSelector(true)}
            onMouseUp={releaseBlur}
            onMouseLeave={releaseBlur}
            onTouchEnd={releaseBlur}
            className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs text-sm cursor-pointer transition"
          >
            ⚙️ Columns
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/80 dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedJobs.length === filteredJobs.length &&
                      filteredJobs.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded bg-gray-800 border-gray-600 text-[#9fff00]"
                  />
                </th>
                {columnsToRender.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnsToRender.length + 2}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto max-w-md">
                      <div className="text-4xl mb-3">🗂️</div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        No job applications found
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Try adjusting your filters or add a new job to get
                        started.
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFilterStatus("All");
                            setSearch("");
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        >
                          Clear filters
                        </button>
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1a1a1a] bg-[#9fff00] hover:bg-[#8fee00] transition cursor-pointer shadow-xs"
                        >
                          Add Job
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job._id}
                    className="odd:bg-transparent even:bg-black/[0.01] dark:even:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job._id)}
                        onChange={() => toggleJobSelection(job._id)}
                        className="rounded bg-gray-800 border-gray-600 text-[#9fff00]"
                      />
                    </td>

                    {columnsToRender.map((col) => (
                      <React.Fragment key={col.key}>
                        {renderCell(job, col.key)}
                      </React.Fragment>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {showArchived ? (
                          <>
                            <button
                              onClick={() => handleUnarchive(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingJob(job)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleArchive(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 hover:bg-black/[0.05] dark:hover:bg-white/10 transition cursor-pointer"
                            >
                              Archive
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 text-center text-gray-500 text-xs">
        <p>
          © {new Date().getFullYear()} ResuAI — Your AI‑Powered Career Assistant
        </p>
      </footer>

      {/* Modals */}
      {showAddForm && (
        <JobModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSave={fetchData}
          user={user}
          visibleColumns={visibleColumns}
        />
      )}

      {editingJob && (
        <JobModal
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={fetchData}
          user={user}
          visibleColumns={visibleColumns}
        />
      )}

      {showColumnSelector && (
        <ColumnSelector
          isOpen={showColumnSelector}
          onClose={() => setShowColumnSelector(false)}
          columns={ALL_COLUMNS}
          visibleColumns={visibleColumns}
          onToggleColumn={(columnKey) => {
            setVisibleColumns((prev) => {
              const set = new Set(prev);
              if (set.has(columnKey)) set.delete(columnKey);
              else set.add(columnKey);
              const order = ALL_COLUMNS.map((c) => c.key);
              return order.filter((k) => set.has(k));
            });
          }}
        />
      )}
    </div>
  );
}
