import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(10, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_GENERATION_MODEL: z.string().default("gemini-2.0-flash,gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.5-pro"),
  GEMINI_EMBEDDING_MODEL: z.string().default("text-embedding-004"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  CORS_ORIGIN: z.string().optional()
});

export const env = envSchema.parse(process.env);
