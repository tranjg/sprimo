import axios from "axios";
import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    setToken: (newToken: string | null) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken_] = useState(localStorage.getItem("token"));
  const [sessionInfo, setSessionInfo] = useState(null);
  const setToken = (newToken: string | null) => {
    setToken_(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token")
    }
  };

  const fetchSession = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/auth/session", {
        withCredentials: true
      })
      if (res.data) {
        setSessionInfo(res.data)
      }
    } catch (error) {
      
    }
  }

  useEffect(() => {
    let token
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      fetchSession()
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      sessionInfo
    }),
    [token,sessionInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
