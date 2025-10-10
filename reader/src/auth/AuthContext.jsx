import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser, logoutUser, registerUser } from "../api/auth.js";
import { getAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready
  const [authPending, setAuthPending] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchCurrentUser()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          logoutUser();
          setUser(null);
          setStatus("ready");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    setAuthPending(true);
    try {
      const payload = await loginUser(credentials);
      setUser(payload.user);
      return payload.user;
    } finally {
      setAuthPending(false);
    }
  };

  const register = async (details) => {
    setAuthPending(true);
    try {
      const payload = await registerUser(details);
      setUser(payload.user);
      return payload.user;
    } finally {
      setAuthPending(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      authPending,
      login,
      register,
      logout,
    }),
    [user, status, authPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
