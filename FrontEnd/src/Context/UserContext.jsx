// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import api from "../services/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("token", token);
          
          // Optionally, sync with backend
          // We can call /users/me just to fetch any MongoDB-specific profile info
          // but for basic usage we just set the user state.
          try {
            const res = await api.get("/users/me");
            setUser({ ...firebaseUser, ...res.data });
          } catch (e) {
            // Backend might not have the user yet if they just registered, handled in signup
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
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
