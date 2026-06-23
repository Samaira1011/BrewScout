const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started (VibePoints catalog)...");

  // Clean the database
  await prisma.reply.deleteMany();
  await prisma.report.deleteMany();
  await prisma.claimRequest.deleteMany();
  await prisma.removedReviewNotice.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.reviewPhoto.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cafePhoto.deleteMany();
  await prisma.cafeVibeTag.deleteMany();
  await prisma.cafeFoodTypeTag.deleteMany();
  await prisma.featuredListing.deleteMany();
  await prisma.event.deleteMany();
  await prisma.flashDeal.deleteMany();
  await prisma.premiumSubscription.deleteMany();
  
  await prisma.redeemedVoucher.deleteMany();
  await prisma.rewardVoucher.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.cafePage.deleteMany();
  
  await prisma.vibeTag.deleteMany();
  await prisma.foodTypeTag.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const maya = await prisma.user.create({
    data: {
      firebaseUid: "maya",
      email: "maya@example.com",
      role: "REVIEWER",
      points: 120, // Give Maya initial points for testing redemption
      level: "SILVER"
    },
  });

  await prisma.user.create({
    data: {
      firebaseUid: "arjun",
      email: "arjun@example.com",
      role: "REVIEWER",
      points: 250,
      level: "SILVER"
    },
  });

  const owner = await prisma.user.create({
    data: {
      firebaseUid: "mock-owner@example.com",
      email: "owner@example.com",
      role: "OWNER"
    }
  });

  console.log("Users created.");

  // Create Vibe Tags
  const vibes = {};
  const vibeNames = [
    "Plant-filled",
    "Date-worthy",
    "Brunch",
    "Deep focus",
    "Work-friendly",
    "Quiet",
    "Late-night",
    "Main character",
    "Music",
  ];
  for (const name of vibeNames) {
    vibes[name] = await prisma.vibeTag.create({ data: { name } });
  }

  // Create Food Tags
  const foods = {};
  const foodNames = ["Coffee", "Bakery", "Sandwiches", "Desserts"];
  for (const name of foodNames) {
    foods[name] = await prisma.foodTypeTag.create({ data: { name } });
  }

  console.log("Tags created.");

  // Create default verified Cafe page owned by our owner
  const cafe = await prisma.cafePage.create({
    data: {
      slug: "nook-and-bloom",
      name: "Nook & Bloom",
      neighborhood: "Indiranagar",
      city: "Bengaluru",
      address: "12th Main, Indiranagar",
      openingHours: JSON.stringify({ open: "9:00 AM", close: "10:00 PM" }),
      description: "A bright, leafy hideout built for long brunches and slow afternoons.",
      gradient: "from-[#ff9a8b] to-[#ff6a88]",
      ownerId: owner.id,
      isVerified: true,
      ratingSum: 14,
      reviewCount: 3
    }
  });

  // Link Cafe Tags
  await prisma.cafeVibeTag.create({ data: { cafeId: cafe.id, vibeTagId: vibes["Plant-filled"].id } });
  await prisma.cafeVibeTag.create({ data: { cafeId: cafe.id, vibeTagId: vibes["Brunch"].id } });
  await prisma.cafeFoodTypeTag.create({ data: { cafeId: cafe.id, foodTypeId: foods["Coffee"].id } });

  // Create Reward Vouchers
  await prisma.rewardVoucher.create({
    data: {
      cafeId: cafe.id,
      title: "Free Signature Cappuccino",
      description: "Enjoy one free house-roasted signature cappuccino on us.",
      pointsCost: 50,
      code: "NOOK-FREE-CAP"
    }
  });

  await prisma.rewardVoucher.create({
    data: {
      cafeId: cafe.id,
      title: "20% Off Brunch Menu",
      description: "Get a 20% discount on any food items from our slow brunch menu.",
      pointsCost: 100,
      code: "NOOK-BRUNCH-20"
    }
  });

  // Create Point Quest
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  await prisma.quest.create({
    data: {
      cafeId: cafe.id,
      title: "Indiranagar Vibe Hunter",
      description: "Submit a receipt-verified review for Nook & Bloom to earn points.",
      bonusPoints: 100,
      startsAt: new Date(),
      endsAt: nextMonth
    }
  });

  console.log("Cafe, Vouchers, and Quests seeded.");
  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
