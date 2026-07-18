import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sp_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("sp_user");
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      localStorage.setItem("sp_token", nextToken);
      localStorage.setItem("sp_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("sp_token");
      localStorage.removeItem("sp_user");
    }
  };

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
