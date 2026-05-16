import { getStoredAccessToken } from "./auth-session";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type UploadImageResult = {
  imageUrl: string;
  key: string;
};

export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const IMAGE_UPLOAD_ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export function validateImageFile(file: File): void {
  if (!IMAGE_UPLOAD_ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type");
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error("Image must be at most 10MB");
  }
}

export async function uploadImage(file: File): Promise<UploadImageResult> {
  validateImageFile(file);

  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${restaurantApiBaseUrl}/uploads/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }

  return (await res.json()) as UploadImageResult;
}

/** Upload pending file on submit; otherwise keep existing remote URL. */
export async function resolveImageUrlForSubmit(
  remoteUrl: string,
  pendingFile: File | null,
): Promise<string | null> {
  if (pendingFile) {
    const { imageUrl } = await uploadImage(pendingFile);
    return imageUrl;
  }
  const trimmed = remoteUrl.trim();
  return trimmed.length > 0 ? trimmed : null;
}
