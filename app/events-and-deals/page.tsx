import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { EventsAndDealsClient } from "@/components/events-and-deals-client";

export const dynamic = "force-dynamic";

export default async function EventsAndDealsPage() {
  const user = await getCurrentUser();
  const now = new Date();

  // 1. Fetch upcoming events
  const events = await prisma.event.findMany({
    where: {
      eventAt: { gte: now },
      cafe: { isVerified: true }
    },
    include: {
      cafe: {
        select: { slug: true, name: true }
      }
    },
    orderBy: { eventAt: "asc" }
  });

  // 2. Fetch active deals
  const deals = await prisma.flashDeal.findMany({
    where: {
      endsAt: { gte: now },
      cafe: { isVerified: true }
    },
    include: {
      cafe: {
        select: { slug: true, name: true }
      }
    },
    orderBy: { endsAt: "asc" }
  });

  // 3. Fetch all active reward vouchers
  const vouchers = await prisma.rewardVoucher.findMany({
    where: { isActive: true },
    include: {
      cafe: {
        select: { name: true }
      }
    },
    orderBy: { pointsCost: "asc" }
  });

  // 4. Fetch active sponsored quests
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      endsAt: { gte: now }
    },
    include: {
      cafe: {
        select: { name: true }
      }
    },
    orderBy: { endsAt: "asc" }
  });

  // 5. Fetch user's claimed vouchers (if logged in)
  let redemptions: any[] = [];
  let userSummary: any = null;

  if (user) {
    userSummary = {
      id: user.id,
      points: user.points,
      level: user.level
    };

    redemptions = await prisma.redeemedVoucher.findMany({
      where: { userId: user.id },
      include: {
        voucher: {
          include: {
            cafe: {
              select: { name: true, address: true }
            }
          }
        }
      },
      orderBy: { redeemedAt: "desc" }
    });
  }

  // Map database dates to simple serializable strings where needed
  const mappedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    coverCloudinaryUrl: e.coverCloudinaryUrl,
    eventAt: e.eventAt.toISOString(),
    cafe: {
      slug: e.cafe.slug,
      name: e.cafe.name
    }
  }));

  const mappedDeals = deals.map(d => ({
    id: d.id,
    title: d.title,
    description: d.description,
    terms: d.terms,
    endsAt: d.endsAt.toISOString(),
    cafe: {
      slug: d.cafe.slug,
      name: d.cafe.name
    }
  }));

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

  const mappedRedemptions = redemptions.map(r => ({
    id: r.id,
    claimCode: r.claimCode,
    isUsed: r.isUsed,
    redeemedAt: r.redeemedAt.toISOString(),
    usedAt: r.usedAt ? r.usedAt.toISOString() : null,
    voucher: {
      title: r.voucher.title,
      description: r.voucher.description,
      cafe: {
        name: r.voucher.cafe.name,
        address: r.voucher.cafe.address
      }
    }
  }));

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">Explore</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl mb-12">Events, Deals & Perks</h1>

        <EventsAndDealsClient
          user={userSummary}
          events={mappedEvents}
          deals={mappedDeals}
          vouchers={mappedVouchers}
          quests={mappedQuests}
          redemptions={mappedRedemptions}
        />
      </div>
    </main>
  );
}
