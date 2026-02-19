import { createContext, useContext, useMemo, useState } from "react";

type AuthCtx = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const Context = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const value = useMemo(() => ({
    token,
    login: (next: string) => {
      localStorage.setItem("token", next);
      localStorage.removeItem("guestToken");
      setToken(next);
    },
    logout: () => {
      localStorage.removeItem("token");
      setToken(null);
    }
  }), [token]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Auth context unavailable");
  return ctx;
};
