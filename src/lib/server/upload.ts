import { v2 as cloudinary } from "cloudinary";
import { AppError } from "./errors";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
  api_key: process.env["CLOUDINARY_API_KEY"] ?? "",
  api_secret: process.env["CLOUDINARY_API_SECRET"] ?? "",
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/** Hard limits enforced before a byte reaches Cloudinary. */
export const UPLOAD_LIMITS = {
  maxBytes: 8 * 1024 * 1024,
  maxPerRequest: 20,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

/**
 * Validates a data-URI image: declared MIME must be on the allowlist, the
 * bytes must actually start with that format's magic number, and the decoded
 * size must fit the limit. Throws AppError with a user-readable message.
 */
export function assertValidImage(dataUri: string): { mime: string; bytes: number } {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUri);
  if (!match) throw new AppError(400, "Image must be a base64 data URI");

  const mime = match[1]!.toLowerCase();
  const payload = match[2]!.replace(/\s/g, "");
  if (!(UPLOAD_LIMITS.allowedTypes as readonly string[]).includes(mime)) {
    throw new AppError(400, "Only JPEG, PNG and WebP images are accepted");
  }

  // Base64 → byte length without decoding the whole thing
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((payload.length * 3) / 4) - padding;
  if (bytes > UPLOAD_LIMITS.maxBytes) {
    throw new AppError(413, `Image is larger than ${UPLOAD_LIMITS.maxBytes / 1024 / 1024} MB`);
  }
  if (bytes < 64) throw new AppError(400, "Image is empty");

  // Magic numbers — the declared type must match the actual bytes
  const head = Buffer.from(payload.slice(0, 32), "base64");
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isWebp =
    head.subarray(0, 4).toString("ascii") === "RIFF" &&
    head.subarray(8, 12).toString("ascii") === "WEBP";
  const matches =
    (mime === "image/jpeg" && isJpeg) ||
    (mime === "image/png" && isPng) ||
    (mime === "image/webp" && isWebp);
  if (!matches) throw new AppError(400, "Image content does not match its declared type");

  return { mime, bytes };
}

// Upload single image
export async function uploadImage(
  base64Data: string,
  folder: string = "properties",
): Promise<UploadResult> {
  assertValidImage(base64Data);
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: `uyjoy/${folder}`,
    resource_type: "image",
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

// Upload multiple images
export async function uploadImages(
  base64DataArray: string[],
  folder: string = "properties",
): Promise<UploadResult[]> {
  if (base64DataArray.length > UPLOAD_LIMITS.maxPerRequest) {
    throw new AppError(400, `At most ${UPLOAD_LIMITS.maxPerRequest} images per request`);
  }
  // Validate everything first so one bad file fails the batch before any upload
  base64DataArray.forEach(assertValidImage);
  const results = await Promise.all(base64DataArray.map((data) => uploadImage(data, folder)));
  return results;
}

// Delete image
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    return false;
  }
}

// Delete multiple images
export async function deleteImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds);
}

// Generate upload signature for direct browser upload
export function generateUploadSignature(folder: string = "properties"): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
} {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `uyjoy/${folder}`,
    },
    process.env["CLOUDINARY_API_SECRET"]!,
  );

  return {
    signature,
    timestamp,
    cloudName: process.env["CLOUDINARY_CLOUD_NAME"]!,
    apiKey: process.env["CLOUDINARY_API_KEY"]!,
  };
}

// Upload avatar
export async function uploadAvatar(base64Data: string, userId: string): Promise<UploadResult> {
  assertValidImage(base64Data);
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: "uyjoy/avatars",
    public_id: userId,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}
