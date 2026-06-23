import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

describe("VibePoints Rewards & Validation integration tests", () => {
  let testUser: any;
  let testOwner: any;
  let testCafe: any;
  let testVoucher: any;
  let claimCode: string;

  beforeAll(async () => {
    // 1. Create a test owner
    testOwner = await prisma.user.create({
      data: {
        firebaseUid: "test-owner-rewards",
        email: "test-owner-rewards@example.com",
        role: "OWNER",
      },
    });

    // 2. Create a test cafe owned by the owner
    testCafe = await prisma.cafePage.create({
      data: {
        slug: "test-rewards-cafe",
        name: "Test Rewards Cafe",
        address: "123 Test Street",
        city: "Test City",
        openingHours: "{}",
        ownerId: testOwner.id,
      },
    });

    // 3. Create a test user (reviewer) with initial points
    testUser = await prisma.user.create({
      data: {
        firebaseUid: "test-user-rewards",
        email: "test-user-rewards@example.com",
        role: "REVIEWER",
        points: 120,
        level: "SILVER",
      },
    });

    // 4. Create a test voucher
    testVoucher = await prisma.rewardVoucher.create({
      data: {
        cafeId: testCafe.id,
        title: "Test Free Latte",
        description: "One free test latte",
        pointsCost: 50,
        code: "TEST-LATTE",
      },
    });
  });

  afterAll(async () => {
    // Clean up test data in reverse dependency order
    await prisma.redeemedVoucher.deleteMany({ where: { voucherId: testVoucher.id } });
    await prisma.rewardVoucher.delete({ where: { id: testVoucher.id } });
    await prisma.pointTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.cafePage.delete({ where: { id: testCafe.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.user.delete({ where: { id: testOwner.id } });
  });

  it("calculates level updates correctly on points changes", () => {
    const getLevelForPoints = (pts: number) => {
      if (pts >= 500) return "GOLD";
      if (pts >= 200) return "SILVER";
      return "BRONZE";
    };

    expect(getLevelForPoints(50)).toBe("BRONZE");
    expect(getLevelForPoints(120)).toBe("BRONZE");
    expect(getLevelForPoints(200)).toBe("SILVER");
    expect(getLevelForPoints(499)).toBe("SILVER");
    expect(getLevelForPoints(500)).toBe("GOLD");
    expect(getLevelForPoints(1200)).toBe("GOLD");
  });

  it("processes voucher redemption successfully", async () => {
    // Simulate /api/rewards POST behavior
    const userBefore = await prisma.user.findUnique({ where: { id: testUser.id } });
    expect(userBefore?.points).toBe(120);

    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    claimCode = `VIBE-${randomHex}`;

    const newPoints = (userBefore?.points || 0) - testVoucher.pointsCost;
    let newLevel = "BRONZE";
    if (newPoints >= 500) newLevel = "GOLD";
    else if (newPoints >= 200) newLevel = "SILVER";

    const [updatedUser, transaction, redemption] = await prisma.$transaction([
      prisma.user.update({
        where: { id: testUser.id },
        data: { points: newPoints, level: newLevel },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: testUser.id,
          amount: -testVoucher.pointsCost,
          action: "VOUCHER_REDEEMED",
          reference: testVoucher.id,
        },
      }),
      prisma.redeemedVoucher.create({
        data: {
          userId: testUser.id,
          voucherId: testVoucher.id,
          claimCode,
        },
      }),
    ]);

    expect(updatedUser.points).toBe(70);
    expect(updatedUser.level).toBe("BRONZE");
    expect(transaction.amount).toBe(-50);
    expect(redemption.claimCode).toBe(claimCode);
    expect(redemption.isUsed).toBe(false);
  });

  it("validates and redeems claims codes through cashier checkout", async () => {
    // Simulate /api/vouchers/redeem-code POST behavior
    const redemption = await prisma.redeemedVoucher.findFirst({
      where: {
        claimCode: claimCode,
        isUsed: false,
      },
      include: {
        voucher: {
          include: { cafe: true },
        },
      },
    });

    expect(redemption).toBeDefined();
    expect(redemption?.voucher.cafeId).toBe(testCafe.id);

    // Verify owner validation passes
    expect(redemption?.voucher.cafe.ownerId).toBe(testOwner.id);

    const updatedRedemption = await prisma.redeemedVoucher.update({
      where: { id: redemption!.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    expect(updatedRedemption.isUsed).toBe(true);
    expect(updatedRedemption.usedAt).toBeDefined();

    // Check that querying the claim code again fails validation (since it is used)
    const checkUsed = await prisma.redeemedVoucher.findFirst({
      where: {
        claimCode: claimCode,
        isUsed: false,
      },
    });
    expect(checkUsed).toBeNull();
  });
});
