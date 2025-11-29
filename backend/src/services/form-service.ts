import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
import type { z } from "zod";
import { v4 as uuid } from "uuid";
import { jsonrepair } from "jsonrepair";
import { env } from "../config/env.js";
import { FormModel, type FormDocument, type FormField } from "../models/Form.js";
import type { UserDocument } from "../models/User.js";
import { logger } from "../utils/logger.js";
import { MemorySnippet } from "../types/memory.js";
import { formSchema, formFieldSchema } from "../utils/validation.js";

const allowedFieldTypes = [
  "text",
  "textarea",
  "email",
  "number",
  "date",
  "datetime",
  "select",
  "checkbox",
  "radio",
  "file",
  "url",
  "phone"
] as const;
type AllowedFieldType = (typeof allowedFieldTypes)[number];

function normalizeFieldType(raw: unknown): AllowedFieldType {
  if (typeof raw !== "string") {
    return "text";
  }

  const value = raw.trim().toLowerCase();
  switch (value) {
    case "dropdown":
    case "drop-down":
    case "choice":
      return "select";
    case "multiple choice":
    case "multi-select":
    case "multiselect":
      return "checkbox";
    case "radio":
    case "radio_button":
    case "radio-button":
      return "radio";
    case "textarea":
    case "long text":
    case "longtext":
      return "textarea";
    case "file":
    case "upload":
    case "image":
      return "file";
    case "phone":
    case "phone_number":
    case "telephone":
      return "phone";
    case "date":
    case "date-only":
      return "date";
    case "datetime":
    case "date_time":
    case "datetime-local":
      return "datetime";
    case "email":
    case "email_address":
      return "email";
    case "url":
    case "link":
      return "url";
    case "number":
    case "numeric":
      return "number";
    case "checkbox":
    case "boolean":
      return "checkbox";
    case "select":
      return "select";
    case "text":
    case "short text":
    case "shorttext":
      return "text";
    default:
      if ((allowedFieldTypes as readonly string[]).includes(value)) {
        return value as AllowedFieldType;
      }
      return "text";
  }
}

function sanitizeGeneratedForm(raw: unknown, fallbackLabel: string): z.infer<typeof formSchema> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Generated form payload is not an object");
  }

  const candidate = raw as Record<string, unknown>;
  const fieldsInput = Array.isArray(candidate.fields) ? candidate.fields : [];

  const sanitizedFields = fieldsInput
    .map((fieldLike, index) => {
      if (!fieldLike || typeof fieldLike !== "object") {
        return null;
      }

      const field = fieldLike as Record<string, unknown>;
      const label = typeof field.label === "string" && field.label.trim() ? field.label.trim() : `Field ${index + 1}`;
      const id = typeof field.id === "string" && field.id.trim() ? field.id : uuid();
      const type = normalizeFieldType(field.type);

      const sanitized: Record<string, unknown> = {
        id,
        label,
        type,
        required: Boolean(field.required)
      };

      if (typeof field.placeholder === "string" && field.placeholder.trim()) {
        sanitized.placeholder = field.placeholder.trim();
      }
      if (typeof field.description === "string" && field.description.trim()) {
        sanitized.description = field.description.trim();
      }
      if (Array.isArray(field.accept)) {
        const accepts = field.accept.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        if (accepts.length > 0) {
          sanitized.accept = accepts;
        }
      }
      if (typeof field.multiline === "boolean") {
        sanitized.multiline = field.multiline;
      }

      if (type === "select" || type === "radio") {
        const optionsSource = Array.isArray(field.options) ? field.options : [];
        const options = optionsSource
          .map((optionLike) => {
            if (!optionLike || typeof optionLike !== "object") {
              return null;
            }
            const option = optionLike as Record<string, unknown>;
            const optionLabel = typeof option.label === "string" ? option.label.trim() : "";
            const optionValue = typeof option.value === "string" ? option.value.trim() : "";
            if (!optionLabel || !optionValue) {
              return null;
            }
            return { label: optionLabel, value: optionValue };
          })
          .filter((option): option is { label: string; value: string } => option !== null);

        if (options.length === 0) {
          options.push({ label: "Option 1", value: "option-1" });
        }
        sanitized.options = options;
      }

      return sanitized;
    })
    .filter((field): field is Record<string, unknown> => field !== null);

  const finalFields = sanitizedFields.length > 0
    ? sanitizedFields
    : [
        {
          id: uuid(),
          label: fallbackLabel,
          type: "textarea"
        }
      ];

  const sanitizedForm: Record<string, unknown> = {
    title: typeof candidate.title === "string" && candidate.title.trim() ? candidate.title.trim() : "Untitled form",
    description: typeof candidate.description === "string" && candidate.description.trim() ? candidate.description.trim() : undefined,
    purpose: typeof candidate.purpose === "string" && candidate.purpose.trim() ? candidate.purpose.trim() : undefined,
    fields: finalFields
  };

  return formSchema.parse(sanitizedForm);
}

const aiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = aiClient.getGenerativeModel({ model: env.GEMINI_EMBEDDING_MODEL });

const generationModelNames = env.GEMINI_GENERATION_MODEL.split(",").map((name) => name.trim()).filter(Boolean);
if (generationModelNames.length === 0) {
  generationModelNames.push("gemini-1.0-pro-latest");
}

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: {
      role: "user",
      parts: [{ text }]
    }
  });
  return result.embedding.values ?? [];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    magnitudeA += a[index] * a[index];
    magnitudeB += b[index] * b[index];
  }
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function buildPrompt(prompt: string, memories: MemorySnippet[], attachments?: string[]): string {
  const memoryPayload = memories.map((memory) => ({
    purpose: memory.purpose ?? "",
    title: memory.title,
    highlights: memory.highlights,
    summary: memory.summary
  }));

  const memoryText = JSON.stringify(memoryPayload, null, 2);
  const attachmentText = attachments && attachments.length > 0 ? `\nReference media URLs: ${attachments.join(", ")}` : "";

  return `You are an intelligent form schema generator.\n\nHere is relevant user form history for reference:\n${memoryText}\n\nNow generate a new form schema for this request:\n"${prompt}"${attachmentText}\n\nReturn ONLY valid JSON matching this TypeScript type:\n{
  "title": string;
  "description"?: string;
  "purpose"?: string;
  "fields": Array<{
    "id": string;
    "label": string;
    "type": "text" | "textarea" | "email" | "number" | "date" | "datetime" | "select" | "checkbox" | "radio" | "file" | "url" | "phone";
    "required"?: boolean;
    "placeholder"?: string;
    "description"?: string;
    "options"?: Array<{ "label": string; "value": string }>;
    "accept"?: string[];
    "multiline"?: boolean;
  }>;
}\n\nDo not include markdown fences.`;
}

function extractJsonPayload(rawText: string): string {
  const trimmed = rawText.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch && fencedMatch[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

export async function retrieveRelevantMemories(userId: string, promptVector: number[], topK = 5): Promise<MemorySnippet[]> {
  const forms = await FormModel.find({ ownerId: userId }, {
    fields: 1,
    memorySummary: 1,
    purpose: 1,
    title: 1,
    embeddingVector: 1
  })
    .lean()
    .exec();

  const scored: MemorySnippet[] = [];

  for (const form of forms) {
    if (!form.embeddingVector || form.embeddingVector.length === 0) {
      continue;
    }
    const score = cosineSimilarity(promptVector, form.embeddingVector);
    scored.push({
      formId: form._id.toString(),
      purpose: form.purpose,
      title: form.title,
      summary: form.memorySummary ?? "",
      highlights: form.fields.slice(0, 5).map((field: FormField) => `${field.label} (${field.type})`),
      score
    });
  }

  return scored
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK)
    .map((memory) => ({
      formId: memory.formId,
      purpose: memory.purpose,
      title: memory.title,
      summary: memory.summary,
      highlights: memory.highlights
    }));
}

export async function generateFormForUser(params: {
  user: UserDocument;
  prompt: string;
  attachments?: string[];
}): Promise<{ form: FormDocument; memories: MemorySnippet[] }> {
  const promptVector = await embedText(params.prompt);
  const memories = await retrieveRelevantMemories(params.user.id, promptVector);

  const promptText = buildPrompt(params.prompt, memories, params.attachments);
  let result: GenerateContentResult | null = null;
  let lastError: unknown = null;

  for (const modelName of generationModelNames) {
    const model = aiClient.getGenerativeModel({ model: modelName });
    try {
      const attempt = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }]
      });
      if (modelName !== generationModelNames[0]) {
        logger.warn({ modelName }, "Form generated using fallback Gemini model");
      }
      result = attempt;
      break;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isMissingModel = message.includes("404") && message.toLowerCase().includes("not found");
      if (isMissingModel) {
        logger.warn({ err: error, modelName }, "Gemini model unavailable, trying fallback");
        continue;
      }
      throw error instanceof Error ? error : new Error(message);
    }
  }

  if (!result) {
    throw lastError instanceof Error ? lastError : new Error("No Gemini model available to generate content");
  }

  const text = result.response.text();
  if (!text) {
    throw new Error("Empty response from form generator");
  }

  type GeneratedForm = z.infer<typeof formSchema>;
  type GeneratedField = z.infer<typeof formFieldSchema>;

  let parsed: GeneratedForm;
  try {
    const payload = extractJsonPayload(text);
    let normalized = payload;
    try {
      normalized = jsonrepair(payload);
    } catch (repairError) {
      logger.warn({ err: repairError }, "Failed to repair AI JSON, falling back to raw payload");
    }
    const raw = JSON.parse(normalized) as unknown;
    parsed = sanitizeGeneratedForm(raw, params.prompt ? "Response" : "Field");
  } catch (error) {
    logger.error({ err: error, raw: text }, "Failed to parse form schema");
    throw new Error("Unable to parse generated form schema");
  }

  const slug = uuid();
  const embeddingVector = promptVector;
  const memorySummary = `${parsed.title}: ${parsed.fields
    .slice(0, 5)
    .map((field: GeneratedField) => `${field.label} (${field.type})`)
    .join(", ")}`;

  const form = await FormModel.create({
    ownerId: params.user._id,
    title: parsed.title,
    description: parsed.description,
    purpose: parsed.purpose,
    sharingSlug: slug,
    fields: parsed.fields,
    embeddingVector,
    memorySummary
  });

  logger.info({ userId: params.user.id, formId: form.id }, "Form generated");

  return { form, memories };
}

export async function listForms(ownerId: string): Promise<FormDocument[]> {
  return FormModel.find({ ownerId }).sort({ createdAt: -1 }).exec();
}

export async function getFormById(ownerId: string, formId: string): Promise<FormDocument | null> {
  return FormModel.findOne({ _id: formId, ownerId }).exec();
}

export async function getFormBySlug(slug: string): Promise<FormDocument | null> {
  return FormModel.findOne({ sharingSlug: slug }).exec();
}
