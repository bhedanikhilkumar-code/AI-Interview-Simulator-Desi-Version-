import { Link, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { SetupPage } from './pages/SetupPage'
import { InterviewPage } from './pages/InterviewPage'
import { DashboardPage } from './pages/DashboardPage'
import { AuthPage } from './pages/AuthPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { useState } from 'react'

export function App() {
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? 'dark min-h-screen' : 'min-h-screen'}>
      <nav className="border-b p-4 flex justify-between bg-white dark:bg-slate-800">
        <Link to="/" className="font-semibold">AI Interview Simulator (Desi Version)</Link>
        <div className="flex gap-4">
          <Link to="/dashboard">History</Link>
          <button onClick={() => setDark((d) => !d)}>{dark ? 'Light' : 'Dark'} Mode</button>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/interview/:id" element={<InterviewPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/session/:id" element={<SessionDetailPage />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
      </Routes>
    </div>
  )
}
