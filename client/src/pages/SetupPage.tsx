import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const defaults = {
  track: 'Frontend', experience: 'Fresher', language: 'Hinglish', difficulty: 'Medium', companyVibe: 'Product-based', timeLimit: 20, resumeText: '', skills: ''
};

export function SetupPage() {
  const [form, setForm] = useState(defaults);
  const nav = useNavigate();
  const { token, guestToken, setGuestToken } = useAuth();

  const start = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
    const res = await api('/sessions/start', { method: 'POST', body: JSON.stringify({ config: payload, guestToken }) }, token ?? undefined, guestToken ?? undefined);
    const data = await res.json();
    if (!token && data.guestToken) setGuestToken(data.guestToken);
    nav(`/interview/${data.sessionId}`);
  };

  return <form onSubmit={start} className="max-w-3xl mx-auto p-6 grid md:grid-cols-2 gap-4">
    {Object.entries({ track: ['Frontend','Backend','Fullstack','Data','HR','Fresher'], experience: ['Fresher','0-2','2-5','5+'], language: ['Hinglish','English','Hindi'], difficulty: ['Easy','Medium','Hard'], companyVibe: ['Startup','MNC','Product-based','Service-based'], timeLimit: [10,20,30]}).map(([k,v]) =>
      <label key={k} className="space-y-1"><span className="text-sm">{k}</span><select className="w-full border p-2 rounded" value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:k==='timeLimit'?Number(e.target.value):e.target.value})}>{v.map((o)=><option key={o}>{o}</option>)}</select></label>
    )}
    <textarea className="md:col-span-2 border p-2 rounded" placeholder="Resume text (optional)" value={form.resumeText} onChange={(e)=>setForm({...form,resumeText:e.target.value})} />
    <input className="md:col-span-2 border p-2 rounded" placeholder="Skills tags comma separated" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} />
    <button className="md:col-span-2 bg-indigo-600 text-white p-2 rounded">Start Interview</button>
  </form>
}
