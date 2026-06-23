const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const RECEIPT_MIME_TYPES = [...PHOTO_MIME_TYPES, "application/pdf"] as const;

export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateRating = (rating: number) => Number.isInteger(rating) && rating >= 1 && rating <= 5;
export const validateFileSize = (size: number) => Number.isFinite(size) && size >= 0 && size <= MAX_FILE_SIZE;
export const validateFileMime = (mime: string, allowed: readonly string[]) => allowed.includes(mime);
export const validateInstagramUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(parsed.hostname);
  } catch {
    return false;
  }
};
export const generateSlug = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
