const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Database clean-up started...");

  try {
    // 1. Delete all relational logs and records
    console.log("Deleting replies, reports, claims, and review notices...");
    await prisma.reply.deleteMany();
    await prisma.report.deleteMany();
    await prisma.claimRequest.deleteMany();
    await prisma.removedReviewNotice.deleteMany();

    console.log("Deleting receipts and review photos...");
    await prisma.receipt.deleteMany();
    await prisma.reviewPhoto.deleteMany();

    console.log("Deleting reviews...");
    await prisma.review.deleteMany();

    console.log("Deleting cafe photos, tag connections, events, deals, and subs...");
    await prisma.cafePhoto.deleteMany();
    await prisma.cafeVibeTag.deleteMany();
    await prisma.cafeFoodTypeTag.deleteMany();
    await prisma.featuredListing.deleteMany();
    await prisma.event.deleteMany();
    await prisma.flashDeal.deleteMany();
    await prisma.premiumSubscription.deleteMany();

    console.log("Deleting cafe pages...");
    await prisma.cafePage.deleteMany();

    // 2. Migrate existing user roles from FEEDBACKER to REVIEWER
    console.log("Migrating user roles from FEEDBACKER to REVIEWER...");
    const updateCount = await prisma.user.updateMany({
      where: { role: "FEEDBACKER" },
      data: { role: "REVIEWER" }
    });
    console.log(`Updated ${updateCount.count} users' roles to REVIEWER.`);

    console.log("Database clean-up completed successfully!");
  } catch (err) {
    console.error("Clean-up failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
