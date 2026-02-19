import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function SessionDetailPage() {
  const { id = '' } = useParams();
  const { token, guestToken } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => { (async () => {
    const res = await api(`/sessions/${id}`, {}, token ?? undefined, guestToken ?? undefined);
    setData(await res.json());
  })(); }, [id]);

  if (!data) return <p className="p-6">Loading...</p>;
  const report = data.report ? JSON.parse(data.report.reportJSON) : null;

  const download = async () => {
    const doc = new jsPDF();
    doc.text(`Interview Report - Score ${report?.overallScore ?? 'N/A'}`, 10, 10);
    doc.text(report?.summary ?? 'Report unavailable', 10, 20, { maxWidth: 180 });
    doc.save(`interview-report-${id}.pdf`);
  };

  return <main className="max-w-4xl mx-auto p-6 space-y-4">
    <h2 className="text-2xl font-semibold">Session Transcript</h2>
    <div className="border rounded p-4 space-y-2">{data.messages.map((m: any) => <p key={m.id}><b>{m.role}:</b> {m.content}</p>)}</div>
    {report && <section className="space-y-2 border rounded p-4">
      <h3 className="text-xl font-semibold">Score: {report.overallScore}/100</h3>
      <p>{report.summary}</p>
      <button className="border px-3 py-1 rounded" onClick={download}>Export report as PDF</button>
    </section>}
  </main>
}
