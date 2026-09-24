// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import api, { IS_DEMO_MODE } from "../services/api";
import { DEMO_USER } from "../services/mockData";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (IS_DEMO_MODE) {
      try {
        const saved = localStorage.getItem("demo_user");
        return saved ? JSON.parse(saved) : DEMO_USER;
      } catch {
        return DEMO_USER;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!IS_DEMO_MODE);

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Logout error:", err);
    }
    if (IS_DEMO_MODE) {
      setUser(DEMO_USER);
      localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
    } else {
      setUser(null);
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
    localStorage.setItem("token", "demo-preview-token");
  };

  useEffect(() => {
    if (IS_DEMO_MODE) {
      if (!localStorage.getItem("token")) {
        localStorage.setItem("token", "demo-preview-token");
      }
      if (!localStorage.getItem("demo_user")) {
        localStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
      }
      setLoading(false);
      return;
    }

    // Real Firebase authentication listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
          setUser(null);
        }
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
      setLoading(false);
    });

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
        isDemoMode: IS_DEMO_MODE,
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
