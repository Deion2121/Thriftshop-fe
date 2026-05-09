// src/features/auth/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { userService } from "./userServices";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------
  // Initialize user session
  // ----------------------------------------
const initSession = useCallback(async () => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("INIT TOKEN:", token); // 🔍 DEBUG

    if (!token) {
      setCurrentUser(null);
      return;
    }

    const user = await userService.getCurrentUser(token);

    setCurrentUser(user);
  } catch (error) {
    console.warn("Session initialization failed:", error.message);
    setCurrentUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // ----------------------------------------
  // Login
  // ----------------------------------------
  const login = (userData, token) => {
    setCurrentUser(userData);

    // Store token if using JWT
    if (token) {
      localStorage.setItem("accessToken", token);
    }
  };

  // ----------------------------------------
  // Logout
  // ----------------------------------------
  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.warn("Logout failed:", error.message);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("accessToken"); // remove JWT if any
    }
  };

  // ----------------------------------------
  // Context value
  // ----------------------------------------
  const value = {
    user: currentUser,
    currentUser,
    isAdmin: currentUser?.role === "admin",
    loading,
    login,
    logout,
    initSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ----------------------------------------
// Custom hook
// ----------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;
