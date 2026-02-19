import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { ChatMessage } from "../types";

const starHint = "Use STAR: Situation (context), Task (responsibility), Action (specific steps), Result (impact with metrics).";

export function InterviewPage() {
  const { id = "" } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api<{ messages: ChatMessage[] }>(`/sessions/${id}`).then((s: any) => setMessages(s.messages));
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const nervousness = useMemo(() => {
    const last = messages.filter((m) => m.role === "candidate").at(-1)?.content.length || 0;
    if (last > 200) return "Calm 😌";
    if (last > 80) return "Steady 🙂";
    return "Nervous 😅";
  }, [messages]);

  const send = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const mine: ChatMessage = { id: crypto.randomUUID(), role: "candidate", content };
    setMessages((m) => [...m, mine]);
    setContent("");
    try {
      const response = await api<{ reply: string }>(`/sessions/${id}/message`, { method: "POST", body: JSON.stringify({ content }) });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "interviewer", content: response.reply }]);
    } finally {
      setLoading(false);
    }
  };

  const end = async () => {
    await api(`/sessions/${id}/end`, { method: "POST" });
    navigate(`/report/${id}`);
  };

  return <div className="max-w-4xl mx-auto p-4">
    <div className="flex justify-between mb-2"><h2 className="text-xl font-semibold">Interview Room</h2><div>⏱️ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div></div>
    <div className="mb-2 text-sm">Nervousness meter: <span className="font-medium">{nervousness}</span></div>
    <div className="border rounded p-3 h-[420px] overflow-y-auto space-y-3">
      {messages.map((m) => <div key={m.id} className={`max-w-[75%] p-2 rounded ${m.role === 'interviewer' ? 'bg-gray-200 dark:bg-gray-800 mr-auto' : 'bg-blue-600 text-white ml-auto'}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />)}
    </div>
    <div className="mt-3 flex gap-2">
      <input className="border rounded p-2 flex-1" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your response..." />
      <button className="px-3 py-2 border rounded" onClick={() => alert(starHint)}>Suggest answer structure</button>
      <button className="px-3 py-2 bg-blue-600 text-white rounded" disabled={loading} onClick={send}>{loading ? '...' : 'Send'}</button>
      <button className="px-3 py-2 bg-red-500 text-white rounded" onClick={end}>End Interview</button>
    </div>
  </div>;
}
