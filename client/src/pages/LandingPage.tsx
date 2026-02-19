import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LandingPage() {
  const nav = useNavigate();
  const { setGuestToken } = useAuth();
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold">AI Interview Simulator (Desi Version)</h1>
      <p>Practice realistic Indian-style interviews with role-based tracks, smart follow-ups, and detailed scorecards.</p>
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => { setGuestToken(crypto.randomUUID()); nav('/setup'); }}>Start as Guest</button>
        <Link className="px-4 py-2 border rounded" to="/auth/login">Login</Link>
        <Link className="px-4 py-2 border rounded" to="/auth/signup">Sign Up</Link>
      </div>
      <section className="grid md:grid-cols-3 gap-4">
        {['Role-based tracks', 'Desi tone + Hinglish mode', 'Score report + roadmap'].map((f) => <div key={f} className="p-4 border rounded bg-white dark:bg-slate-800">{f}</div>)}
      </section>
    </main>
  )
}
