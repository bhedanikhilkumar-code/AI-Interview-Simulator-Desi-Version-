import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; email: string };
      guestToken?: string;
    }
  }
}

export const authOptional = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.auth = verifyToken(header.slice(7));
    } catch {
      req.auth = undefined;
    }
  }
  req.guestToken = typeof req.headers["x-guest-token"] === "string" ? req.headers["x-guest-token"] : undefined;
  next();
};

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.auth = verifyToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
