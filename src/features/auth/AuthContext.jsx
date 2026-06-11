import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { userService } from "./userServices";

const SESSION_KEY = "tab_session_active";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setCurrentUser(userData);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.warn("Logout failed:", error.message);
    } finally {
      sessionStorage.removeItem(SESSION_KEY);
      setCurrentUser(null);
    }
  };

  const initSession = useCallback(async () => {
    // Check if tab was closed and reopened (sessionStorage cleared)
    const sessionValid = sessionStorage.getItem(SESSION_KEY) === "true";

    if (!sessionValid) {
      // Tab was closed - logout to invalidate server session
      try {
        await userService.logout();
      } catch (error) {
        // Ignore if already logged out
      }
    }

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      if (error.message !== "Failed to fetch") {
        console.warn("Session initialization failed:", error.message);
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();

    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SESSION_KEY);
    };

    const handlePageHide = () => {
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [initSession]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;
