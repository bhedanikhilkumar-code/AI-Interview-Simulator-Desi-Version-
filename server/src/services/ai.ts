import OpenAI from "openai";
import { Message } from "@prisma/client";
import { InterviewConfig, ReportPayload } from "../types/index.js";
import { aiReplySchema, reportSchema } from "../utils/schemas.js";

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.API_BASE_URL
});

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

async function callJson(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages,
    temperature: 0.7
  });
  return completion.choices[0]?.message?.content || "{}";
}

export async function generateInterviewerReply(config: InterviewConfig, history: Message[]) {
  const recent = history.slice(-12).map((m) => `${m.role}: ${m.content}`).join("\n");
  const system = `You are an Indian interviewer with polite, direct corporate tone. Slightly witty. Ask one question at a time. Keep concise. No rude/discriminatory language. Hinglish if selected. Ask follow-ups referencing candidate answers. For technical roles ask practical coding/design/debug interview questions without requiring running code.`;
  const user = `Interview config: ${JSON.stringify(config)}\nConversation:\n${recent}\nReturn JSON: {"reply":"...","intent":"question|followup|closing","difficulty":"...","tags":["..."]}`;

  let raw = await callJson([
    { role: "system", content: system },
    { role: "user", content: user }
  ]);
  try {
    return aiReplySchema.parse(JSON.parse(raw));
  } catch {
    raw = await callJson([
      { role: "system", content: `${system} Return valid JSON only.` },
      { role: "user", content: user }
    ]);
    return aiReplySchema.parse(JSON.parse(raw));
  }
}

export async function generateReport(config: InterviewConfig, history: Message[]): Promise<ReportPayload> {
  const transcript = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  const system = `You are an Indian interview evaluator. Be fair, specific, practical, and concise. No discrimination. Produce strict JSON only.`;
  const prompt = `Config: ${JSON.stringify(config)}\nTranscript:\n${transcript}\nReturn exactly this schema with valid JSON only:
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

  let raw = await callJson([
    { role: "system", content: system },
    { role: "user", content: prompt }
  ]);
  try {
    return reportSchema.parse(JSON.parse(raw));
  } catch {
    raw = await callJson([
      { role: "system", content: `${system} Return valid JSON only.` },
      { role: "user", content: prompt }
    ]);
    return reportSchema.parse(JSON.parse(raw));
  }
}
