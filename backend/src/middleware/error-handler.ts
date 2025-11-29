import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(error: unknown, request: Request, response: Response, next: NextFunction): void {
  logger.error({ err: error, path: request.path }, "Unexpected error");
  if (response.headersSent) {
    next(error);
    return;
  }
  response.status(500).json({ message: "Internal server error" });
}
