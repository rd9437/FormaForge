import type { Request, Response } from "express";
import { retrieveRelevantMemories } from "../services/form-service.js";

export async function listMemories(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const memories = await retrieveRelevantMemories(request.user.id, [], 10);
  response.json(memories);
}
