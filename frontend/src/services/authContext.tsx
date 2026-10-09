import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { apiFetch, refreshAccessToken, setAccessToken } from "./api";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;


    async function restoreSession() {
      try {
        const refreshed = await refreshAccessToken();
    
        if (!refreshed) {
          if (!cancelled) {
            setIsAuthenticated(false);
          }
          return;
        }
    
        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        setAccessToken(null);
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }


    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function login(token: string) {
    setAccessToken(token);
    setIsAuthenticated(true);
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}