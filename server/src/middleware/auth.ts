import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import { verifyToken } from "../utils/auth";

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;
  if (bearer?.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(bearer.replace("Bearer ", ""));
    } catch {
      req.user = undefined;
    }
  }
  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;
  if (!bearer?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    req.user = verifyToken(bearer.replace("Bearer ", ""));
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
