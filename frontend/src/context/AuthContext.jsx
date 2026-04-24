import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service.js";

const AuthContext = createContext(null);

const getStoredAuth = () => {
  const token = localStorage.getItem("blt_token");
  const user = localStorage.getItem("blt_user");
  return { token, user: user ? JSON.parse(user) : null };
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(getStoredAuth().token);
  const [user, setUser] = useState(getStoredAuth().user);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.me();
      setUser(profile);
      localStorage.setItem("blt_user", JSON.stringify(profile));
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("blt_token");
      localStorage.removeItem("blt_user");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email, password, entityId) => {
    const { token: newToken, user: newUser } = await authService.login(
      email,
      password,
      entityId,
    );
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("blt_token", newToken);
    localStorage.setItem("blt_user", JSON.stringify(newUser));
    if (entityId) localStorage.setItem("entityId", entityId);
    navigate("/dashboard");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("blt_token");
    localStorage.removeItem("blt_user");
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      setUser,
    }),
    [token, user, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
