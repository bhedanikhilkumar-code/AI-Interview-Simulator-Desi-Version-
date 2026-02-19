import { FormEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
  const { mode = 'login' } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { setToken } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      const data = await res.json();
      setToken(data.token);
      nav('/setup');
    } catch (error: any) { setErr(error.message); } finally { setLoading(false); }
  };

  return <form onSubmit={submit} className="max-w-md mx-auto mt-10 p-6 border rounded space-y-3">
    <h2 className="text-2xl font-bold capitalize">{mode}</h2>
    <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input type="password" className="w-full border rounded p-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
    {err && <p className="text-red-600">{err}</p>}
    <button disabled={loading} className="w-full bg-indigo-600 text-white p-2 rounded">{loading ? 'Please wait...' : 'Continue'}</button>
  </form>
}
