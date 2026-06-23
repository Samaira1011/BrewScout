import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function saveLocalFile(base64String: string, prefix: string): Promise<string> {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  
  const fileExt = mimeType.split("/")[1] || "jpg";
  const filename = `${prefix}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  
  return `/uploads/${filename}`;
}
