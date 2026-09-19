// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import api from "../services/api";
import { DEMO_USER } from "../services/mockData";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Always logged in as Demo User for preview/showcase mode
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("demo_user");
      return saved ? JSON.parse(saved) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });
  const [loading] = useState(false);

  // Set demo token automatically so authenticated requests succeed
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", "demo-preview-token");
    }
    if (!localStorage.getItem("demo_user")) {
      localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
    }
  }, []);

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    // In preview mode, keep the user logged in as demo user or reset demo data
    setUser(DEMO_USER);
    localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
    localStorage.setItem("token", "demo-preview-token");
  };

  useEffect(() => {
    // If Firebase auth is configured, listen to real auth changes as an option
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            localStorage.setItem("token", token);
            try {
              const res = await api.get("/users/me");
              setUser({ ...firebaseUser, ...res.data });
            } catch {
              setUser(firebaseUser);
            }
          } catch (err) {
            console.error("Auth state change error:", err);
          }
        }
      });
    } catch {
      // Firebase not configured in environment; demo user stays active
    }

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        loginAsDemo,
        loading,
        isDemoMode: true,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
