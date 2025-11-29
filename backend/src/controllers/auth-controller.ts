import type { Request, Response } from "express";
import { z } from "zod";
import { registerUser, authenticateUser, createSessionToken } from "../services/auth-service.js";
import { createAuthCookie } from "../utils/jwt.js";
import { env } from "../config/env.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function register(request: Request, response: Response): Promise<void> {
  const payload = registerSchema.parse(request.body);
  const user = await registerUser(payload);
  const token = createSessionToken(user);
  const cookie = createAuthCookie(token);

  response.cookie(cookie.name, cookie.value, cookie.options);
  response.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function login(request: Request, response: Response): Promise<void> {
  const payload = loginSchema.parse(request.body);
  const user = await authenticateUser(payload);
  const token = createSessionToken(user);
  const cookie = createAuthCookie(token);

  response.cookie(cookie.name, cookie.value, cookie.options);
  response.status(200).json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function logout(request: Request, response: Response): Promise<void> {
  const isProduction = env.NODE_ENV === "production";
  response.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
  response.status(200).json({ success: true });
}

export async function profile(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Not authenticated" });
    return;
  }

  response.json({ user: { id: request.user.id, email: request.user.email, name: request.user.name } });
}
