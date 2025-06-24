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
  // State to hold the authentication token
  const [token, setToken_] = useState(localStorage.getItem("token"));

  // Function to set the authentication token
  const setToken = (newToken: string | null) => {
    setToken_(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token")
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;