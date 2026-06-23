import { describe, expect, it, vi } from "vitest";
import { sendWelcomeEmail, sendSignInAlert, sendVoucherBackupEmail } from "@/lib/mailer";

describe("Mailer utility tests", () => {
  it("should send welcome email for reviewer without throwing errors", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    
    await expect(sendWelcomeEmail("test-reviewer@example.com", "REVIEWER")).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should send welcome email for business owner without throwing errors", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    
    await expect(sendWelcomeEmail("test-merchant@example.com", "OWNER")).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should send sign-in alert email without throwing errors", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    
    await expect(sendSignInAlert("test-user@example.com", 150, "SILVER")).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should send voucher backup email without throwing errors", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    
    await expect(sendVoucherBackupEmail("test-user@example.com", "Indie Cafe", "Free Cappuccino", "VIBE-XYZ123")).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
