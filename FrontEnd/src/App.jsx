import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./Components/Home/HomePage";
import LoginPage from "./Components/UserAuthintication/Log-In";
import SignUpPage from "./Components/UserAuthintication/Sign-Up";
import { UserProvider } from "./Context/UserContext";
import JobTracker from "./Components/JobApplicationTrackerComp/JobTracker";
import Layout from "./Components/Layout/Layout";
import Dashboard from "./Components/DashboardComp/Dashboard";
import Settings from "./Components/Settings/Settings";
import ResumeExamples from "./Components/ResumeExamples/ResumeExamples";
// NEW: Create Resume Page (WYSIWYG)
import ResumeEditorPage from "./Components/CreateResume/wysiwyg/ResumeEditorPage";
import VerifyEmailPage from "./Components/UserAuthintication/VerifyEmailPage";

import ProtectedRoute from "./Components/Layout/ProtectedRoute";

function AnimatedRoutes() {
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);

  return (
    <UserProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes (no layout) */}
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Home />
              </motion.div>
            }
          />

          <Route
            path="/login"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <LoginPage />
              </motion.div>
            }
          />

          <Route
            path="/register"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <SignUpPage />
              </motion.div>
            }
          />

          {/* Protected routes with Layout */}
          {/* Dashboard routes */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Dashboard />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Dashboard />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/JobTracker"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <JobTracker />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobtracker"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <JobTracker />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Settings routes (both /settings and /Dashboard/settings) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Layout>
                    <Settings />
                  </Layout>
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Dashboard/settings"
            element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Layout>
                    <Settings />
                  </Layout>
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/* Templates / Resume Examples routes */}
          <Route
            path="/resume-examples"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Layout>
                  <ResumeExamples onTemplateSelect={setSelectedTemplate} />
                </Layout>
              </motion.div>
            }
          />
          <Route
            path="/templates"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Layout>
                  <ResumeExamples onTemplateSelect={setSelectedTemplate} />
                </Layout>
              </motion.div>
            }
          />
          <Route
            path="/examples"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Layout>
                  <ResumeExamples onTemplateSelect={setSelectedTemplate} />
                </Layout>
              </motion.div>
            }
          />

          {/* Create Resume (Full Screen Editor with App Navbar) */}
          <Route
            path="/create-resume"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 h-full flex flex-col overflow-hidden"
                  >
                    <ResumeEditorPage />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </UserProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
