import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { RewardsStoreClient } from "@/components/rewards-store-client";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch all active reward vouchers
  const vouchers = await prisma.rewardVoucher.findMany({
    where: { isActive: true },
    include: {
      cafe: {
        select: { name: true }
      }
    },
    orderBy: { pointsCost: "asc" }
  });

  // Fetch active sponsored quests
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      endsAt: { gte: new Date() }
    },
    include: {
      cafe: {
        select: { name: true }
      }
    },
    orderBy: { endsAt: "asc" }
  });

  // Map to simple serializable objects for client component
  const userSummary = {
    id: user.id,
    points: user.points,
    level: user.level
  };

  const mappedVouchers = vouchers.map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    pointsCost: v.pointsCost,
    cafe: { name: v.cafe.name }
  }));

  const mappedQuests = quests.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    bonusPoints: q.bonusPoints,
    endsAt: q.endsAt.toISOString(),
    cafe: { name: q.cafe.name }
  }));

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-5xl">
        <RewardsStoreClient 
          user={userSummary}
          initialVouchers={mappedVouchers}
          initialQuests={mappedQuests}
        />
      </div>
    </main>
  );
}
