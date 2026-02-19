import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (payload: { userId: string; email: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
