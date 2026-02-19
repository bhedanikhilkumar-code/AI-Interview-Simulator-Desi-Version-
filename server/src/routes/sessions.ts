import { randomUUID } from "crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import { optionalAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { configSchema, guestTokenSchema, messageSchema } from "../utils/validation";
import { generateInterviewerReply, generateReport } from "../services/ai";
import { AuthRequest } from "../types";
import html_to_pdf from "html-pdf-node";

export const sessionsRouter = Router();

const msgLimiter = rateLimit({ windowMs: 60_000, max: 20, message: "Too many messages, slow down." });

const canAccessSession = (req: AuthRequest, session: { userId: string | null; guestToken: string | null }) => {
  if (req.user?.userId && session.userId === req.user.userId) return true;
  const guest = typeof req.headers["x-guest-token"] === "string" ? req.headers["x-guest-token"] : null;
  return !!guest && session.guestToken === guest;
};

sessionsRouter.post("/start", optionalAuth, async (req: AuthRequest, res) => {
  const parsed = configSchema.safeParse(req.body.config);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const guestToken = req.user ? null : (req.body.guestToken || randomUUID());
  const session = await prisma.session.create({
    data: {
      userId: req.user?.userId,
      guestToken,
      configJSON: JSON.stringify(parsed.data)
    }
  });

  return res.json({ sessionId: session.id, guestToken });
});

sessionsRouter.post("/:id/message", optionalAuth, msgLimiter, async (req: AuthRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { messages: true } });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });

  const clean = sanitizeHtml(parsed.data.content, { allowedTags: [], allowedAttributes: {} });
  await prisma.message.create({ data: { sessionId: session.id, role: "candidate", content: clean } });

  const config = JSON.parse(session.configJSON);
  const allMessages = [...session.messages, { role: "candidate", content: clean }].map((m) => ({
    role: m.role as "candidate" | "interviewer",
    content: m.content
  }));
  const ai = await generateInterviewerReply(config, allMessages);
  const stored = await prisma.message.create({
    data: { sessionId: session.id, role: "interviewer", content: sanitizeHtml(ai.reply || "Can you elaborate?", { allowedTags: [], allowedAttributes: {} }) }
  });
  return res.json({ reply: stored.content, meta: ai });
});

sessionsRouter.post("/:id/end", optionalAuth, async (req: AuthRequest, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });

  const config = JSON.parse(session.configJSON);
  const report = await generateReport(config, session.messages.map((m) => ({ role: m.role as any, content: m.content })));

  await prisma.session.update({ where: { id: session.id }, data: { endedAt: new Date(), overallScore: Math.round(report.overallScore) } });
  await prisma.report.upsert({ where: { sessionId: session.id }, create: { sessionId: session.id, reportJSON: JSON.stringify(report) }, update: { reportJSON: JSON.stringify(report) } });

  return res.json(report);
});

sessionsRouter.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const guest = guestTokenSchema.safeParse({ guestToken: req.headers["x-guest-token"] });
  const sessions = await prisma.session.findMany({
    where: req.user?.userId ? { userId: req.user.userId } : { guestToken: guest.success ? guest.data.guestToken : undefined },
    orderBy: { startedAt: "desc" }
  });
  return res.json(sessions);
});

sessionsRouter.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { messages: true, report: true } });
  if (!session) return res.status(404).json({ message: "Not found" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });
  return res.json(session);
});

sessionsRouter.delete("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session) return res.status(404).json({ message: "Not found" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });
  await prisma.session.delete({ where: { id: session.id } });
  return res.json({ ok: true });
});

sessionsRouter.get("/:id/report", optionalAuth, async (req: AuthRequest, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { report: true } });
  if (!session) return res.status(404).json({ message: "Not found" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });
  if (!session.report) return res.status(404).json({ message: "Report missing" });
  return res.json(JSON.parse(session.report.reportJSON));
});

sessionsRouter.get("/:id/pdf", optionalAuth, async (req: AuthRequest, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id }, include: { report: true } });
  if (!session || !session.report) return res.status(404).json({ message: "Report missing" });
  if (!canAccessSession(req, session)) return res.status(403).json({ message: "Forbidden" });
  const report = JSON.parse(session.report.reportJSON);
  const html = `<html><body><h1>Interview Report</h1><p>Score: ${report.overallScore}</p><h2>Summary</h2><p>${report.summary}</p></body></html>`;
  const pdf = await html_to_pdf.generatePdf({ content: html }, { format: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});
