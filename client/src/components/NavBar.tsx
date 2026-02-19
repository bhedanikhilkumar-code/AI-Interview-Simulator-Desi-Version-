import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function NavBar({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const { token, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <Link to="/" className="font-bold text-lg">AI Interview Simulator (Desi Version)</Link>
      <div className="flex gap-3 items-center">
        <button onClick={onToggleDark} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">{dark ? "Light" : "Dark"}</button>
        <Link to="/dashboard" className="text-sm">Dashboard</Link>
        <Link to="/setup" className="text-sm">Start</Link>
        {token ? <button onClick={logout} className="text-sm text-red-500">Logout</button> : <Link to="/login" className="text-sm">Login</Link>}
      </div>
    </nav>
  );
}
