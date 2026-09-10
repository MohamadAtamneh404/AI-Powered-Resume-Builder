import React, { useState, useEffect } from "react";
import api from "../../services/api";
import ResumeRenderer from "./ResumeRenderer";
import { useNavigate } from "react-router-dom";

const Spinner = () => (
  <div className="flex justify-center items-center py-12 w-full">
    <svg
      className="animate-spin h-8 w-8 text-purple-500"
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

const TemplateSelectionPage = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userData, setUserData] = useState(null); // We'll fetch this later
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get("/templates");
        setTemplates(data);
        setSelectedTemplate(data[0]); // Select the first template by default
      } catch (error) {
        setApiError("Failed to fetch templates. Please try again later.");
        console.error("Failed to fetch templates", error);
      } finally {
        setLoading(false);
      }
    };

    // In a real app, you'd fetch the user's resume data here
    // For now, we'll use some mock data
    const fetchUserData = () => {
      setUserData({
        basics: {
          name: "John Doe",
          label: "Software Engineer",
          email: "john.doe@example.com",
          phone: "123-456-7890",
        },
        work: [
          {
            company: "Tech Corp",
            position: "Senior Developer",
            startDate: "2020-01-01",
            endDate: "Present",
            summary: "Developing amazing things.",
          },
        ],
      });
    };

    fetchTemplates();
    fetchUserData();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      navigate("/create-resume", { state: { template: selectedTemplate } });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">Choose a Template</h1>

      {apiError && (
        <div className="mb-6 p-4 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
          {apiError}
        </div>
      )}

      {templates.length === 0 && !apiError ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-900/60 rounded-xl border border-white/10">
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Templates Found
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Check back later for new templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <ul className="space-y-2">
              {templates.map((template) => {
                const isSelected =
                  (selectedTemplate?.id || selectedTemplate?._id) ===
                  (template.id || template._id);
                return (
                  <li
                    key={template.id || template._id}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                  <h2 className="font-bold">{template.name}</h2>
                  <p className="text-sm opacity-80">{template.description}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUseTemplate}
              className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
            >
              Use This Template
            </button>
          </div>
          <div className="md:col-span-2">
            {selectedTemplate && userData ? (
              <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200">
                <ResumeRenderer
                  template={selectedTemplate}
                  resumeData={userData}
                />
              </div>
            ) : (
              <div className="text-gray-400">
                Select a template to see a preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectionPage;
