import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { logger } from "../utils/logger.js";

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export async function authRequired(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const token = request.cookies?.token ?? request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      response.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    const user = await UserModel.findById(payload.sub).exec();

    if (!user) {
      response.status(401).json({ message: "Invalid session" });
      return;
    }

    request.user = user;
    next();
  } catch (error) {
    logger.warn({ err: error }, "Auth guard failed");
    response.status(401).json({ message: "Authentication failed" });
  }
}
