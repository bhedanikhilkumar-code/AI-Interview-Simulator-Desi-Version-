import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { InterviewConfig } from "../types";

const initial: InterviewConfig = { track: "Frontend", experience: "Fresher", languageStyle: "Hinglish", difficulty: "Medium", companyVibe: "Startup", timeLimit: 10, resumeText: "", skills: [] };

export function SetupPage() {
  const [config, setConfig] = useState<InterviewConfig>(initial);
  const [skillsInput, setSkillsInput] = useState("");
  const navigate = useNavigate();

  const start = async () => {
    const payload = { ...config, skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean) };
    const data = await api<{ sessionId: string; guestToken?: string }>("/sessions/start", { method: "POST", body: JSON.stringify({ config: payload }) });
    if (data.guestToken) localStorage.setItem("guestToken", data.guestToken);
    navigate(`/interview/${data.sessionId}`);
  };

  return <div className="max-w-2xl mx-auto p-6 grid gap-3">
    <h2 className="text-2xl font-semibold">Interview Setup</h2>
    {([
      ["track", ["Frontend", "Backend", "Fullstack", "Data", "HR", "Fresher"]],
      ["experience", ["Fresher", "0-2", "2-5", "5+"]],
      ["languageStyle", ["Hinglish", "English", "Hindi"]],
      ["difficulty", ["Easy", "Medium", "Hard"]],
      ["companyVibe", ["Startup", "MNC", "Product-based", "Service-based"]],
      ["timeLimit", [10, 20, 30]]
    ] as const).map(([key, options]) => <select key={key} className="border p-2 rounded" value={String(config[key as keyof InterviewConfig])} onChange={(e) => setConfig((prev) => ({ ...prev, [key]: key === 'timeLimit' ? Number(e.target.value) : e.target.value }))}>
      {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
    </select>)}
    <textarea className="border p-2 rounded" rows={4} placeholder="Paste resume text (optional)" value={config.resumeText} onChange={(e) => setConfig((p) => ({ ...p, resumeText: e.target.value }))} />
    <input className="border p-2 rounded" placeholder="Skills tags comma-separated" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
    <button onClick={start} className="bg-blue-600 text-white rounded px-4 py-2">Start Interview</button>
  </div>;
}
