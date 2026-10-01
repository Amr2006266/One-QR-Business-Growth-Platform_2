import { randomUUID } from "crypto";

/**
 * Generate a new UUID v4 ID
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Generate a URL-safe slug from a business name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}
