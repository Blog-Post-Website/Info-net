import { supabase } from "./client";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_THUMBNAILS_BUCKET || "post-images";

function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureImageFile(file: File) {
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image is too large. Max size is 5MB.");
  }
}

export async function uploadThumbnailFromDevice(file: File, userId?: string): Promise<string> {
  ensureImageFile(file);

  const safeUserId = sanitizeFilenameSegment(userId || "user");
  const rawName = file.name || "thumbnail";
  const dot = rawName.lastIndexOf(".");
  const base = dot > 0 ? rawName.slice(0, dot) : rawName;
  const ext = dot > 0 ? rawName.slice(dot + 1) : "";

  const safeBase = sanitizeFilenameSegment(base) || "thumbnail";
  const safeExt = sanitizeFilenameSegment(ext) || "img";
  const fileName = `${Date.now()}-${safeBase}.${safeExt}`;

  const objectPath = `thumbnails/${safeUserId}/${fileName}`;

  const { error } = await supabase.storage.from(bucketName).upload(objectPath, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) {
    const message = (error as { message?: string })?.message;
    throw new Error(message || "Failed to upload image.");
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);

  if (!data?.publicUrl) {
    throw new Error("Uploaded, but could not generate a public URL.");
  }

  return data.publicUrl;
}
