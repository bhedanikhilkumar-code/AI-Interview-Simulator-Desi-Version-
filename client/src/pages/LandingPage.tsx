import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">AI Interview Simulator (Desi Version)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Practice realistic Indian corporate interviews in Hinglish/English/Hindi with role-based tracks, follow-up questions, and detailed feedback reports.</p>
      <div className="flex gap-4 mb-10">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/setup')}>Start as Guest</button>
        <button className="px-4 py-2 border rounded" onClick={() => navigate('/login')}>Login</button>
        <button className="px-4 py-2 border rounded" onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {['Role-based interview tracks', 'Follow-up and deep-dive questioning', 'Score + roadmap + PDF report'].map((f) => (
          <div key={f} className="p-4 rounded border border-gray-200 dark:border-gray-700">{f}</div>
        ))}
      </div>
    </main>
  );
}
