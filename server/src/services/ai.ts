import OpenAI from "openai";
import { env } from "../lib/env";
import { InterviewConfig } from "../types";

type ChatMsg = { role: "interviewer" | "candidate"; content: string };

const client = new OpenAI({ apiKey: env.API_KEY, baseURL: env.API_BASE_URL });

const interviewerSystemPrompt = (cfg: InterviewConfig) => `You are an Indian corporate interviewer. Tone: polite, direct, slightly witty, professional. Never rude/discriminatory. Ask one concise question at a time. Language style: ${cfg.language}. Track: ${cfg.track}, exp: ${cfg.experience}, difficulty: ${cfg.difficulty}, company vibe: ${cfg.companyVibe}. Use follow-ups referencing candidate's previous answers. For technical roles ask practical coding/design/debug style interview questions without requiring running code.
Return JSON only: {"reply":"...","intent":"question|followup|closing","difficulty":"Easy|Medium|Hard","tags":["..."]}`;

export async function generateInterviewerReply(config: InterviewConfig, messages: ChatMsg[]) {
  const recent = messages.slice(-12).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const userPrompt = `Interview context:\n${JSON.stringify(config)}\nConversation:\n${recent}`;
  const res = await client.chat.completions.create({
    model: env.AI_MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: interviewerSystemPrompt(config) },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  return safeJson(raw, { reply: "Great. Let's continue. Tell me about a recent challenge.", intent: "question", difficulty: config.difficulty, tags: [config.track] });
}

const reportPrompt = `Return strict JSON only with schema:
{
  "overallScore": number,
  "subscores": { "communication": number, "technical": number, "problemSolving": number, "confidence": number, "structure": number },
  "strengths": string[],
  "improvements": string[],
  "weakAnswers": [{ "question": string, "yourAnswer": string, "betterAnswer": string }],
  "roadmap7Days": string[],
  "roadmap30Days": string[],
  "summary": string
}`;

export async function generateReport(config: InterviewConfig, transcript: ChatMsg[]) {
  const convo = transcript.map((m) => `${m.role}: ${m.content}`).join("\n");
  const run = async (strict = false) => client.chat.completions.create({
    model: env.AI_MODEL,
    temperature: 0.4,
    messages: [
      { role: "system", content: `You are an interview evaluator for Indian candidates. Be fair, specific and concise. ${reportPrompt}` },
      { role: "user", content: `Config: ${JSON.stringify(config)}\nTranscript:\n${convo}${strict ? "\nReturn valid JSON only. No markdown." : ""}` }
    ],
    response_format: { type: "json_object" }
  });

  let raw = (await run()).choices[0]?.message?.content ?? "{}";
  let parsed = validateReport(raw);
  if (!parsed) {
    raw = (await run(true)).choices[0]?.message?.content ?? "{}";
    parsed = validateReport(raw);
  }
  if (!parsed) {
    throw new Error("Could not generate valid report JSON");
  }
  return parsed;
}

function safeJson(raw: string, fallback: any) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function validateReport(raw: string) {
  try {
    const j = JSON.parse(raw);
    if (typeof j.overallScore !== "number" || !j.subscores) return null;
    return j;
  } catch {
    return null;
  }
}
