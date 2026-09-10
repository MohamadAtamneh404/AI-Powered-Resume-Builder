import React, { useState } from "react";
import api from "../../services/api";

export default function JobModal({ isOpen, job, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    position: job?.position || "",
    company: job?.company || "",
    location: job?.location || "",
    jobLink: job?.jobLink || "",
    status: job?.status || "Applied",
    dateApplied: job?.dateApplied
      ? new Date(job.dateApplied).toISOString().split("T")[0]
      : "",
    deadline: job?.deadline
      ? new Date(job.deadline).toISOString().split("T")[0]
      : "",
    notes: job?.notes || "",
    salary: job?.salary || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const cleanedData = {
      userId: user?._id,
      ...formData,
    };
    try {
      // Use clean /jobs endpoint since api has baseURL: /api
      const url = job ? `/jobs/${job._id}` : "/jobs";
      const apiMethod = job ? api.put : api.post;
      await apiMethod(url, cleanedData);

      onSave();
      onClose();
    } catch (err) {
      alert(
        "Error saving job application: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <h2 className="font-['Outfit'] text-2xl font-bold text-[#1a1a1a] dark:text-zinc-100">
                {job ? "Edit Job Application" : "Log New Application"}
              </h2>
              <p className="text-xs text-[#8e8e8e] dark:text-zinc-400 mt-0.5">
                Track interview progress, deadlines, and ATS compliance notes.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 flex items-center justify-center text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 transition"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Position / Role *
                </label>
                <input
                  type="text"
                  name="position"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Stripe, Linear, Google"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition cursor-pointer"
                >
                  <option value="Applied" className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-zinc-100">Applied</option>
                  <option value="Interviewing" className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-zinc-100">Interviewing</option>
                  <option value="Offer" className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-zinc-100">Offer</option>
                  <option value="Rejected" className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-zinc-100">Rejected</option>
                  <option value="Saved" className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-zinc-100">Saved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Remote / San Francisco"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Salary / Compensation
                </label>
                <input
                  type="text"
                  name="salary"
                  placeholder="$160k - $190k"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Date Applied
                </label>
                <input
                  type="date"
                  name="dateApplied"
                  value={formData.dateApplied}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                  Job URL Link
                </label>
                <input
                  type="url"
                  name="jobLink"
                  placeholder="https://company.com/careers/..."
                  value={formData.jobLink}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e8e] dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                Notes & ATS Keywords
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Key recruiter contact, missing keywords, preparation questions..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] text-[#1a1a1a] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a1a1a] dark:focus:border-zinc-400 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 text-xs transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1a1a1a] dark:text-zinc-200 text-xs font-medium rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : job
                    ? "Update Application"
                    : "Log Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
