import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  const load = () => api<any[]>('/sessions').then(setSessions);
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await api(`/sessions/${id}`, { method: 'DELETE' });
    load();
  };

  return <div className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl font-semibold mb-4">Interview History</h2>
    <div className="space-y-2">
      {sessions.map((s) => <div key={s.id} className="p-3 border rounded flex items-center justify-between">
        <div>
          <div className="font-medium">{JSON.parse(s.configJSON).track} • Score: {s.overallScore ?? 'Pending'}</div>
          <div className="text-sm text-gray-500">{new Date(s.startedAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <Link className="text-blue-600" to={`/report/${s.id}`}>View</Link>
          <button className="text-red-500" onClick={() => remove(s.id)}>Delete</button>
        </div>
      </div>)}
    </div>
  </div>;
}
