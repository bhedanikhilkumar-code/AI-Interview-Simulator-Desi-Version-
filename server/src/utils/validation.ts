import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = signupSchema;

export const configSchema = z.object({
  track: z.enum(["Frontend", "Backend", "Fullstack", "Data", "HR", "Fresher"]),
  experience: z.enum(["Fresher", "0-2", "2-5", "5+"]),
  language: z.enum(["Hinglish", "English", "Hindi"]).default("Hinglish"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  companyVibe: z.enum(["Startup", "MNC", "Product-based", "Service-based"]),
  timeLimit: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  resumeText: z.string().max(8000).optional().default(""),
  skills: z.array(z.string().min(1)).max(20).optional().default([])
});

export const messageSchema = z.object({
  content: z.string().min(1).max(3000)
});

export const guestTokenSchema = z.object({
  guestToken: z.string().optional()
});
