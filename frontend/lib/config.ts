const legacyBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ??
	(legacyBackendUrl ? `${legacyBackendUrl.replace(/\/?$/, "")}/api` : "http://localhost:4000/api");

export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
