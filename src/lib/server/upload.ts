import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

// Upload single image
export async function uploadImage(
  base64Data: string,
  folder: string = "properties"
): Promise<UploadResult> {
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
  folder: string = "properties"
): Promise<UploadResult[]> {
  const results = await Promise.all(
    base64DataArray.map((data) => uploadImage(data, folder))
  );
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
export function generateUploadSignature(
  folder: string = "properties"
): { signature: string; timestamp: number; cloudName: string; apiKey: string } {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `uyjoy/${folder}`,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}

// Upload avatar
export async function uploadAvatar(base64Data: string, userId: string): Promise<UploadResult> {
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
