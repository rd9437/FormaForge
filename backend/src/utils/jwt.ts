import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: Record<string, unknown>, options?: jwt.SignOptions): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d", ...options });
}

export function createAuthCookie(token: string) {
  return {
    name: "token",
    value: token,
    options: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  };
}
