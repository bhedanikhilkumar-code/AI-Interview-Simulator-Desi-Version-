import { createContext, useContext, useMemo, useState } from 'react'

type AuthCtx = {
  token: string | null;
  guestToken: string | null;
  setToken: (t: string | null) => void;
  setGuestToken: (t: string | null) => void;
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [guestToken, setGuestToken] = useState<string | null>(localStorage.getItem('guestToken'));
  const value = useMemo(() => ({
    token,
    guestToken,
    setToken: (t: string | null) => { setToken(t); t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); },
    setGuestToken: (t: string | null) => { setGuestToken(t); t ? localStorage.setItem('guestToken', t) : localStorage.removeItem('guestToken'); }
  }), [token, guestToken]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth inside provider');
  return ctx;
}
