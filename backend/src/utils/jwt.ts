import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: Record<string, unknown>, options?: jwt.SignOptions): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d", ...options });
}

export function createAuthCookie(token: string) {
  const isProduction = env.NODE_ENV === "production";
  const sameSite: "strict" | "none" | "lax" | boolean | undefined = isProduction ? "none" : "lax";

  return {
    name: "token",
    value: token,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  };
}
