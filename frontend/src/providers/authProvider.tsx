import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  token: string | null;
  setToken: (newToken: string | null) => void;
  sessionInfo?: any; // add session info shape if you want
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/session", {
          withCredentials: true,
        });

        if (res.data.accessToken) {
          setToken(res.data.accessToken);
        }
        console.log("Session Info: ", res.data)
        setSessionInfo(res.data);
      } catch (error) {
        setSessionInfo(null);
        setToken(null);
      }
    }

    if (!token) {
      fetchSession();
    } else {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      sessionInfo,
    }),
    [token, sessionInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
