import DOMPurify from 'dompurify';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

type Msg = { role: 'interviewer'|'candidate'; content: string };

export function InterviewPage() {
  const { id = '' } = useParams();
  const { token, guestToken } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([{ role: 'interviewer', content: 'Namaste! Chaliye start karte hain. Please introduce yourself briefly.' }]);
  const [text, setText] = useState('');
  const [sec, setSec] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const nervousness = Math.max(10, Math.min(100, 80 - (messages.at(-1)?.content.length || 0) / 3 + (sec % 30)));

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const my = text.trim();
    if (!my) return;
    setMessages((m) => [...m, { role: 'candidate', content: my }]);
    setText('');
    const res = await api(`/sessions/${id}/message`, { method: 'POST', body: JSON.stringify({ content: my }) }, token ?? undefined, guestToken ?? undefined);
    const data = await res.json();
    setMessages((m) => [...m, { role: 'interviewer', content: data.reply }]);
  };

  const endInterview = async () => {
    await api(`/sessions/${id}/end`, { method: 'POST' }, token ?? undefined, guestToken ?? undefined);
    nav(`/session/${id}`);
  };

  return <main className="max-w-4xl mx-auto p-4 space-y-4">
    <div className="flex justify-between"><h2 className="text-2xl font-semibold">Interview Room</h2><p>⏱️ {Math.floor(sec / 60)}:{String(sec % 60).padStart(2,'0')}</p></div>
    <div className="h-2 bg-slate-200 rounded"><div className="h-2 bg-orange-500 rounded" style={{ width: `${nervousness}%` }} /></div>
    <p className="text-sm">Nervousness meter: {Math.round(nervousness)}%</p>
    <section className="border rounded p-3 space-y-3 min-h-80">
      {messages.map((m, i) => <div key={i} className={`max-w-[75%] p-3 rounded ${m.role === 'interviewer' ? 'bg-slate-100 dark:bg-slate-800 mr-auto' : 'bg-indigo-600 text-white ml-auto'}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />)}
    </section>
    <button className="border rounded px-3 py-2" onClick={() => setText('Use STAR: Situation, Task, Action, Result. Mention metrics and ownership.')}>Suggest answer structure (STAR)</button>
    <form onSubmit={send} className="flex gap-2">
      <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type your response..." />
      <button className="bg-indigo-600 text-white px-4 rounded">Send</button>
      <button type="button" onClick={endInterview} className="border px-4 rounded">End Interview</button>
    </form>
  </main>
}
