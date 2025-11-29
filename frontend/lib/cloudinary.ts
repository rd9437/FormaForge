import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/config";
import { mediaApi } from "@/lib/api-client";

interface SignaturePayload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

export async function requestUploadSignature(folder?: string): Promise<SignaturePayload> {
  const signature = await mediaApi.requestSignature({ folder, resourceType: "image" });
  return signature;
}

export async function uploadImageViaCloudinary(file: File, signature?: SignaturePayload): Promise<string> {
  if (!signature) {
    signature = await requestUploadSignature();
  }

  const formData = new FormData();
  if (CLOUDINARY_UPLOAD_PRESET) {
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  }
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("api_key", signature.apiKey);
  if (signature.folder) {
    formData.append("folder", signature.folder);
  }
  formData.append("file", file);

  const cloudName = signature.cloudName || CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Missing Cloudinary cloud name configuration");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorBody}`);
  }

  const payload = (await response.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("Cloudinary upload missing secure_url");
  }

  return payload.secure_url;
}
