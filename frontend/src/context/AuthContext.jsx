import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi, getProfile } from "../services/authService";
import apiClient from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // If we have a token, fetch the latest user profile to ensure session is valid
          const res = await getProfile();
          setUser(res.data.user);
        } catch (err) {
          console.error("Auth initialization failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { token: newToken, user: newUser } = res.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    return res;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optionally call backend logout
    apiClient.post("/logout").catch(() => {});
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role?.name === "admin" || user?.role_id === 1, // Depending on how backend returns role
    isQuizMaker: user?.role?.name === "quiz_maker" || user?.role_id === 2,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
