import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export function createUploadSignature(params: { folder?: string; resourceType?: string }) {
  const timestamp = Math.round(Date.now() / 1000);

  const payload: Record<string, unknown> = {
    timestamp,
    resource_type: params.resourceType ?? "image"
  };

  if (params.folder) {
    payload.folder = params.folder;
  }

  if (env.CLOUDINARY_UPLOAD_PRESET) {
    payload.upload_preset = env.CLOUDINARY_UPLOAD_PRESET;
  }

  const signature = cloudinary.utils.api_sign_request(payload, env.CLOUDINARY_API_SECRET);

  return {
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: params.folder
  };
}
