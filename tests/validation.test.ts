import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { PHOTO_MIME_TYPES, RECEIPT_MIME_TYPES, validateFileMime, validateFileSize, validateRating } from "@/lib/validation";

describe("shared validation properties", () => {
  it("rejects ratings outside 1-5", () => fc.assert(fc.property(fc.integer().filter(n => n < 1 || n > 5), n => !validateRating(n))));
  it("accepts exactly ratings 1-5", () => fc.assert(fc.property(fc.integer({ min: 1, max: 5 }), n => validateRating(n))));
  it("rejects files larger than 10 MB", () => fc.assert(fc.property(fc.integer({ min: 10 * 1024 * 1024 + 1 }), n => !validateFileSize(n))));
  it("uses distinct photo and receipt MIME allowlists", () => {
    expect(validateFileMime("application/pdf", PHOTO_MIME_TYPES)).toBe(false);
    expect(validateFileMime("application/pdf", RECEIPT_MIME_TYPES)).toBe(true);
  });
});
