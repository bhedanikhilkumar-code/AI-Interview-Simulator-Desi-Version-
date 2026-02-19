import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, apiUrl } from "../lib/api";

export function ReportPage() {
  const { id = "" } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api(`/sessions/${id}/report`).then(setReport);
  }, [id]);

  const exportLocalPdf = () => {
    const pdf = new jsPDF();
    pdf.text(`AI Interview Report - Score ${report?.overallScore}/100`, 10, 10);
    pdf.text(report?.summary || '', 10, 20, { maxWidth: 180 });
    pdf.save(`report-${id}.pdf`);
  };

  if (!report) return <div className="p-6">Loading report...</div>;
  return <div className="max-w-4xl mx-auto p-6 space-y-4">
    <h2 className="text-2xl font-bold">Score: {report.overallScore}/100</h2>
    <p>{report.summary}</p>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="border rounded p-3"><h3 className="font-semibold">Strengths</h3><ul className="list-disc pl-5">{report.strengths.map((s: string) => <li key={s}>{s}</li>)}</ul></div>
      <div className="border rounded p-3"><h3 className="font-semibold">Improvements</h3><ul className="list-disc pl-5">{report.improvements.map((s: string) => <li key={s}>{s}</li>)}</ul></div>
    </div>
    <div className="border rounded p-3"><h3 className="font-semibold">7 Day Roadmap</h3><ul className="list-disc pl-5">{report.roadmap7Days.map((r: string) => <li key={r}>{r}</li>)}</ul></div>
    <div className="flex gap-3">
      <a className="px-3 py-2 rounded bg-gray-800 text-white" href={`${apiUrl}/sessions/${id}/pdf`} target="_blank">Download Server PDF</a>
      <button className="px-3 py-2 rounded border" onClick={exportLocalPdf}>Export quick PDF</button>
    </div>
  </div>;
}
