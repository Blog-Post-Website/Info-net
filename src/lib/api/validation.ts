import { NextRequest } from "next/server";

type ValidatedPostPayload = {
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  meta_description: string;
  featured_image_url: string | null;
  is_featured: boolean;
};

type ValidatedPostUpdatePayload = Partial<ValidatedPostPayload>;

type ValidatedVersionPayload = {
  title: string;
  content: string;
};

const TITLE_MAX = 180;
const CONTENT_MAX = 100000;
const SLUG_MAX = 120;
const EXCERPT_MAX = 320;
const META_DESCRIPTION_MAX = 320;
const FEATURED_IMAGE_URL_MAX = 2048;

function sanitizeBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  return defaultValue;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeText(value: unknown, defaultValue = ""): string {
  if (typeof value !== "string") return defaultValue;
  return value.trim();
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeFeaturedImageUrl(value: unknown): string | null {
  const url = sanitizeText(value);
  if (!url) return null;
  if (url.length > FEATURED_IMAGE_URL_MAX) {
    throw new Error(`Featured image URL must be <= ${FEATURED_IMAGE_URL_MAX} characters`);
  }
  if (!isValidHttpUrl(url)) {
    throw new Error("Featured image URL must be a valid http(s) URL");
  }
  return url;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function parseJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new Error("Invalid JSON payload");
  }
}

export function validateCreatePostPayload(input: unknown): ValidatedPostPayload {
  if (!isPlainObject(input)) {
    throw new Error("Invalid payload");
  }

  const title = sanitizeText(input.title);
  const content = sanitizeText(input.content);
  const slug = sanitizeText(input.slug).toLowerCase();
  const excerpt = sanitizeText(input.excerpt);
  const meta_description = sanitizeText(input.meta_description);
  const featured_image_url = sanitizeFeaturedImageUrl(input.featured_image_url);
  const is_featured = sanitizeBoolean(input.is_featured, false);

  if (!title) throw new Error("Title is required");
  if (!slug) throw new Error("Slug is required");
  if (title.length > TITLE_MAX) throw new Error(`Title must be <= ${TITLE_MAX} characters`);
  if (content.length > CONTENT_MAX) throw new Error(`Content must be <= ${CONTENT_MAX} characters`);
  if (slug.length > SLUG_MAX) throw new Error(`Slug must be <= ${SLUG_MAX} characters`);
  if (!isValidSlug(slug)) throw new Error("Slug format is invalid");
  if (excerpt.length > EXCERPT_MAX) throw new Error(`Excerpt must be <= ${EXCERPT_MAX} characters`);
  if (meta_description.length > META_DESCRIPTION_MAX) {
    throw new Error(`Meta description must be <= ${META_DESCRIPTION_MAX} characters`);
  }

  return { title, content, slug, excerpt, meta_description, featured_image_url, is_featured };
}

export function validateUpdatePostPayload(input: unknown): ValidatedPostUpdatePayload {
  if (!isPlainObject(input)) {
    throw new Error("Invalid payload");
  }

  const allowedFields = new Set([
    "title",
    "content",
    "slug",
    "excerpt",
    "meta_description",
    "featured_image_url",
    "is_featured",
  ]);
  const incomingFields = Object.keys(input);

  if (incomingFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const invalidField = incomingFields.find((field) => !allowedFields.has(field));
  if (invalidField) {
    throw new Error(`Field '${invalidField}' is not allowed`);
  }

  const updates: ValidatedPostUpdatePayload = {};

  if ("title" in input) {
    const title = sanitizeText(input.title);
    if (!title) throw new Error("Title cannot be empty");
    if (title.length > TITLE_MAX) throw new Error(`Title must be <= ${TITLE_MAX} characters`);
    updates.title = title;
  }

  if ("content" in input) {
    const content = sanitizeText(input.content);
    if (content.length > CONTENT_MAX) throw new Error(`Content must be <= ${CONTENT_MAX} characters`);
    updates.content = content;
  }

  if ("slug" in input) {
    const slug = sanitizeText(input.slug).toLowerCase();
    if (!slug) throw new Error("Slug cannot be empty");
    if (slug.length > SLUG_MAX) throw new Error(`Slug must be <= ${SLUG_MAX} characters`);
    if (!isValidSlug(slug)) throw new Error("Slug format is invalid");
    updates.slug = slug;
  }

  if ("excerpt" in input) {
    const excerpt = sanitizeText(input.excerpt);
    if (excerpt.length > EXCERPT_MAX) throw new Error(`Excerpt must be <= ${EXCERPT_MAX} characters`);
    updates.excerpt = excerpt;
  }

  if ("meta_description" in input) {
    const meta_description = sanitizeText(input.meta_description);
    if (meta_description.length > META_DESCRIPTION_MAX) {
      throw new Error(`Meta description must be <= ${META_DESCRIPTION_MAX} characters`);
    }
    updates.meta_description = meta_description;
  }

  if ("featured_image_url" in input) {
    updates.featured_image_url = sanitizeFeaturedImageUrl(input.featured_image_url);
  }

  if ("is_featured" in input) {
    updates.is_featured = sanitizeBoolean(input.is_featured, false);
  }

  return updates;
}

export function validateVersionPayload(input: unknown): ValidatedVersionPayload {
  if (!isPlainObject(input)) {
    throw new Error("Invalid payload");
  }

  const title = sanitizeText(input.title);
  const content = sanitizeText(input.content);

  if (!title) throw new Error("Title is required");
  if (title.length > TITLE_MAX) throw new Error(`Title must be <= ${TITLE_MAX} characters`);
  if (content.length > CONTENT_MAX) throw new Error(`Content must be <= ${CONTENT_MAX} characters`);

  return { title, content };
}

export function parsePagination(searchParams: URLSearchParams) {
  const rawLimit = Number(searchParams.get("limit") || 20);
  const rawOffset = Number(searchParams.get("offset") || 0);

  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 100) : 20;
  const offset = Number.isFinite(rawOffset) ? Math.min(Math.max(Math.floor(rawOffset), 0), 10000) : 0;

  return { limit, offset };
}
