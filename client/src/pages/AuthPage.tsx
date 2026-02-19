import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export function AuthPage() {
  const { mode } = useParams();
  const isSignup = mode === "signup";
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ token: string }>(`/auth/${isSignup ? 'signup' : 'login'}`, { method: "POST", body: JSON.stringify({ email, password }) });
      login(data.token);
      navigate('/dashboard');
    } catch {
      setError("Authentication failed");
    }
  };

  return <form onSubmit={submit} className="max-w-md mx-auto p-6 space-y-4">
    <h2 className="text-2xl font-semibold">{isSignup ? 'Sign Up' : 'Login'}</h2>
    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="Email" />
    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border p-2 rounded" placeholder="Password" />
    {error && <div className="text-red-500 text-sm">{error}</div>}
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Continue</button>
  </form>;
}
