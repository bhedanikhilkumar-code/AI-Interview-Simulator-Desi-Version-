import { Router } from "express";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { loginSchema, signupSchema } from "../utils/validation";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const user = await prisma.user.create({
    data: { email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) }
  });

  return res.json({ token: signToken({ userId: user.id, email: user.email }) });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await comparePassword(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({ token: signToken({ userId: user.id, email: user.email }) });
});
