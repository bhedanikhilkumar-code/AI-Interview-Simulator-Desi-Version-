import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = signupSchema;

export const startSessionSchema = z.object({
  config: z.object({
    track: z.enum(["Frontend", "Backend", "Fullstack", "Data", "HR", "Fresher"]),
    experience: z.enum(["Fresher", "0-2", "2-5", "5+"]),
    languageStyle: z.enum(["Hinglish", "English", "Hindi"]).default("Hinglish"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    companyVibe: z.enum(["Startup", "MNC", "Product-based", "Service-based"]),
    timeLimit: z.union([z.literal(10), z.literal(20), z.literal(30)]),
    resumeText: z.string().optional(),
    skills: z.array(z.string()).optional()
  })
});

export const messageSchema = z.object({
  content: z.string().min(1).max(2000)
});

export const aiReplySchema = z.object({
  reply: z.string(),
  intent: z.enum(["question", "followup", "closing"]),
  difficulty: z.string(),
  tags: z.array(z.string())
});

export const reportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  subscores: z.object({
    communication: z.number().min(0).max(100),
    technical: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    structure: z.number().min(0).max(100)
  }),
  strengths: z.array(z.string()).min(3).max(6),
  improvements: z.array(z.string()).min(3).max(6),
  weakAnswers: z.array(z.object({
    question: z.string(),
    yourAnswer: z.string(),
    betterAnswer: z.string()
  })).min(1).max(2),
  roadmap7Days: z.array(z.string()),
  roadmap30Days: z.array(z.string()),
  summary: z.string()
});
