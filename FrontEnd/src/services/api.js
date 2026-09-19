import axios from "axios";
import { auth } from "./firebase";

// Create an Axios instance configured with the /api base URL
// Vite's proxy will route these to the BackEnd
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to add fresh Authorization token
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");
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

// Intercept responses to handle 401 errors gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      auth.currentUser
    ) {
      originalRequest._retry = true;
      try {
        // Force refresh Firebase token
        const freshToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem("token", freshToken);
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed, proceed to logout
      }
    }

    if (error.response && error.response.status === 401) {
      // Only clear and redirect if the user is truly unauthenticated
      if (!auth.currentUser) {
        localStorage.removeItem("token");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/sign-up" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
