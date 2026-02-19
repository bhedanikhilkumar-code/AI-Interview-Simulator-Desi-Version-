import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

type Session = { id: string; startedAt: string; configJSON: string; overallScore?: number | null };

export function DashboardPage() {
  const { token, guestToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = async () => {
    const res = await api('/sessions', {}, token ?? undefined, guestToken ?? undefined);
    setSessions(await res.json());
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    await api(`/sessions/${id}`, { method: 'DELETE' }, token ?? undefined, guestToken ?? undefined);
    load();
  };

  return <main className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl font-semibold mb-4">Interview History</h2>
    <div className="space-y-3">
      {sessions.map((s) => {
        const cfg = JSON.parse(s.configJSON);
        return <div key={s.id} className="border rounded p-3 flex justify-between items-center">
          <div>
            <p>{new Date(s.startedAt).toLocaleString()} • {cfg.track}</p>
            <p className="text-sm text-slate-500">Score: {s.overallScore ?? 'Pending'}</p>
          </div>
          <div className="flex gap-3">
            <Link className="underline" to={`/session/${s.id}`}>View</Link>
            <button className="text-red-600" onClick={() => del(s.id)}>Delete</button>
          </div>
        </div>
      })}
    </div>
  </main>
}
