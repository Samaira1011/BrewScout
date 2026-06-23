import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Custom Vibe Tagging integration tests", () => {
  let testUser: any;
  let testCafe: any;

  beforeAll(async () => {
    // 1. Create a test reviewer user
    testUser = await prisma.user.create({
      data: {
        firebaseUid: "test-vibe-reviewer",
        email: "vibe-reviewer@example.com",
        role: "REVIEWER",
      },
    });

    // 2. Create a test cafe page
    testCafe = await prisma.cafePage.create({
      data: {
        slug: "vibe-testing-cafe",
        name: "Vibe Testing Cafe",
        address: "456 Vibe Avenue",
        city: "Vibe City",
        openingHours: "{}",
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.cafeVibeTag.deleteMany({ where: { cafeId: testCafe.id } });
    await prisma.cafePage.delete({ where: { id: testCafe.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    
    // Clean up created vibe tags if they exist
    const testTag = await prisma.vibeTag.findUnique({ where: { name: "jazz-playlist" } });
    if (testTag) {
      await prisma.vibeTag.delete({ where: { id: testTag.id } });
    }
  });

  it("successfully upserts and links custom vibes to a cafe page", async () => {
    const rawVibe = "jazz-playlist";

    // Simulate backend /api/cafes/[slug]/vibes logic
    let vibeTag = await prisma.vibeTag.findFirst({
      where: {
        name: {
          equals: rawVibe,
          mode: "insensitive"
        }
      }
    });

    if (!vibeTag) {
      vibeTag = await prisma.vibeTag.create({
        data: { name: rawVibe }
      });
    }

    expect(vibeTag.name).toBe("jazz-playlist");

    const relation = await prisma.cafeVibeTag.create({
      data: {
        cafeId: testCafe.id,
        vibeTagId: vibeTag.id
      }
    });

    expect(relation.cafeId).toBe(testCafe.id);
    expect(relation.vibeTagId).toBe(vibeTag.id);

    // Verify it is queryable in the DB
    const cafeWithVibes = await prisma.cafePage.findUnique({
      where: { id: testCafe.id },
      include: { vibeTags: { include: { tag: true } } }
    });

    expect(cafeWithVibes?.vibeTags.length).toBe(1);
    expect(cafeWithVibes?.vibeTags[0].tag.name).toBe("jazz-playlist");
  });
});
