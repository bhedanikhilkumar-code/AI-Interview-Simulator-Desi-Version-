import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  API_BASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
