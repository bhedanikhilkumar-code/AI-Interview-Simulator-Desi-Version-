import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../utils/prisma.js";
import { authOptional } from "../middleware/auth.js";
import { messageSchema, startSessionSchema } from "../utils/schemas.js";
import { generateInterviewerReply, generateReport } from "../services/ai.js";
import { sanitizeText } from "../utils/sanitize.js";
import { InterviewConfig } from "../types/index.js";
import { randomUUID } from "crypto";
import html_to_pdf from "html-pdf-node";

export const sessionsRouter = Router();
const messageLimiter = rateLimit({ windowMs: 60 * 1000, max: 25, standardHeaders: true, legacyHeaders: false });

sessionsRouter.use(authOptional);

const canAccess = (ownerId: string | null, guestToken: string | null, reqUser?: string, reqGuest?: string) =>
  (ownerId && reqUser === ownerId) || (!ownerId && guestToken && reqGuest === guestToken);

sessionsRouter.post("/start", async (req, res) => {
  const parsed = startSessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const config = parsed.data.config;
  const session = await prisma.session.create({
    data: {
      userId: req.auth?.userId,
      guestToken: req.auth?.userId ? null : req.guestToken || randomUUID(),
      configJSON: JSON.stringify(config)
    }
  });

  const intro = "Namaste! Let's begin. Please introduce yourself briefly and tell me why this role interests you.";
  await prisma.message.create({ data: { sessionId: session.id, role: "interviewer", content: intro } });

  res.json({ sessionId: session.id, guestToken: session.guestToken, openingQuestion: intro });
});

sessionsRouter.post("/:id/message", messageLimiter, async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const clean = sanitizeText(parsed.data.content);
  await prisma.message.create({ data: { sessionId: session.id, role: "candidate", content: clean } });

  const history = await prisma.message.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" } });
  const ai = await generateInterviewerReply(JSON.parse(session.configJSON) as InterviewConfig, history);

  await prisma.message.create({ data: { sessionId: session.id, role: "interviewer", content: ai.reply } });
  res.json(ai);
});

sessionsRouter.post("/:id/end", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const history = await prisma.message.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" } });
  const report = await generateReport(JSON.parse(session.configJSON) as InterviewConfig, history);

  await prisma.session.update({
    where: { id: session.id },
    data: { endedAt: new Date(), overallScore: Math.round(report.overallScore) }
  });

  await prisma.report.upsert({
    where: { sessionId: session.id },
    create: { sessionId: session.id, reportJSON: JSON.stringify(report) },
    update: { reportJSON: JSON.stringify(report) }
  });

  res.json(report);
});

sessionsRouter.get("/", async (req, res) => {
  const where = req.auth?.userId ? { userId: req.auth.userId } : { guestToken: req.guestToken || "" };
  const sessions = await prisma.session.findMany({ where, orderBy: { startedAt: "desc" } });
  res.json(sessions);
});

sessionsRouter.get("/:id", async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: "asc" } }, report: true }
  });
  if (!session || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session);
});

sessionsRouter.delete("/:id", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session not found" });
  }
  await prisma.session.delete({ where: { id: session.id } });
  res.json({ success: true });
});

sessionsRouter.get("/:id/report", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { report: true } });
  if (!session || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session.report ? JSON.parse(session.report.reportJSON) : null);
});

sessionsRouter.get("/:id/pdf", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { report: true } });
  if (!session || !session.report || !canAccess(session.userId, session.guestToken, req.auth?.userId, req.guestToken)) {
    return res.status(404).json({ error: "Session/report not found" });
  }

  const report = JSON.parse(session.report.reportJSON);
  const html = `<html><body><h1>AI Interview Report</h1><p>Score: ${report.overallScore}/100</p><h3>Summary</h3><p>${report.summary}</p></body></html>`;
  const file = { content: html };
  const pdf = await html_to_pdf.generatePdf(file, { format: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=report-${session.id}.pdf`);
  res.send(pdf);
});
