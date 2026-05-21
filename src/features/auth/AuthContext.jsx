import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { userService } from "./userServices";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initSession = useCallback(async () => {
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
  }, [initSession]);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.warn("Logout failed:", error.message);
    } finally {
      setCurrentUser(null);
    }
  };

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
