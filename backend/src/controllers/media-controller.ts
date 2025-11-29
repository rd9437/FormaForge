import type { Request, Response } from "express";
import { z } from "zod";
import { createUploadSignature } from "../services/media-service.js";

const signatureSchema = z.object({
  folder: z.string().optional(),
  resourceType: z.string().optional()
});

export function createSignature(request: Request, response: Response): void {
  const payload = signatureSchema.parse(request.body ?? {});
  const signature = createUploadSignature(payload);
  response.json(signature);
}
