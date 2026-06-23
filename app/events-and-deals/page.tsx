import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsAndDealsPage() {
  const now = new Date();

  // Fetch all upcoming events
  const events = await prisma.event.findMany({
    where: {
      eventAt: { gte: now },
      cafe: { isVerified: true }
    },
    include: { cafe: true },
    orderBy: { eventAt: "asc" }
  });

  // Fetch all active deals
  const deals = await prisma.flashDeal.findMany({
    where: {
      endsAt: { gte: now },
      cafe: { isVerified: true }
    },
    include: { cafe: true },
    orderBy: { endsAt: "asc" }
  });

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">What's happening</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl mb-12">Events & Flash Deals</h1>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Upcoming Events Column */}
          <div>
            <div className="border-b border-[#e7dff0] pb-4 mb-6 flex justify-between items-baseline">
              <h2 className="text-2xl font-black">📅 Upcoming Events</h2>
              <span className="rounded-full bg-[#f4eff9] px-3 py-1 text-xs font-bold text-[#7441b5]">
                {events.length} listed
              </span>
            </div>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-[#e7dff0] p-10 bg-white text-center text-sm text-[#756a7d]">
                No upcoming events listed at this time. Check back soon!
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="rounded-3xl bg-white p-6 card-shadow border border-[#e7dff0]/50 flex flex-col justify-between">
                    <div>
                      {event.coverCloudinaryUrl && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#e7dff0] mb-4">
                          <img src={event.coverCloudinaryUrl} alt={event.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <Link href={`/cafes/${event.cafe.slug}`} className="text-xs font-bold uppercase tracking-wider text-[#ff6679] hover:underline">
                        📍 {event.cafe.name}
                      </Link>
                      <h3 className="text-xl font-black text-[#21152d] mt-1.5">{event.title}</h3>
                      <p className="text-sm text-[#564b60] mt-2 leading-relaxed">{event.description}</p>
                    </div>
                    <div className="mt-6 border-t border-[#f4eff9] pt-4 flex items-center justify-between">
                      <span className="text-xs font-black text-[#7441b5] bg-[#f4eff9] px-3 py-1.5 rounded-xl">
                        🕒 {new Date(event.eventAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <Link href={`/cafes/${event.cafe.slug}`} className="text-xs font-black text-[#21152d] hover:translate-x-0.5 transition-transform">
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flash Deals Column */}
          <div>
            <div className="border-b border-[#e7dff0] pb-4 mb-6 flex justify-between items-baseline">
              <h2 className="text-2xl font-black">🔥 Active Flash Deals</h2>
              <span className="rounded-full bg-[#f4eff9] px-3 py-1 text-xs font-bold text-[#ff6679]">
                {deals.length} active
              </span>
            </div>

            {deals.length === 0 ? (
              <div className="rounded-2xl border border-[#e7dff0] p-10 bg-white text-center text-sm text-[#756a7d]">
                No active flash deals right now. Check back soon for discounts!
              </div>
            ) : (
              <div className="space-y-6">
                {deals.map((deal) => (
                  <div key={deal.id} className="rounded-3xl bg-gradient-to-br from-[#21152d] to-[#3a1d4d] text-white p-6 card-shadow relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#ff6679] to-[#7441b5] opacity-20 blur-3xl pointer-events-none" />
                    <div>
                      <Link href={`/cafes/${deal.cafe.slug}`} className="text-xs font-bold uppercase tracking-wider text-[#c9ff4d] hover:underline">
                        📍 {deal.cafe.name}
                      </Link>
                      <h3 className="text-xl font-black text-white mt-2">{deal.title}</h3>
                      <p className="text-sm text-white/70 mt-2 leading-relaxed">{deal.description}</p>
                      {deal.terms && (
                        <p className="text-[11px] text-white/40 mt-2 italic">Terms: {deal.terms}</p>
                      )}
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-[#ff6679] text-white px-2.5 py-1 rounded-lg">
                        Ends: {new Date(deal.endsAt).toLocaleDateString()}
                      </span>
                      <Link href={`/cafes/${deal.cafe.slug}`} className="text-xs font-black text-[#c9ff4d] hover:underline">
                        Redeem Deal →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
