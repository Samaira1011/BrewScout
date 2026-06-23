"use client";

import { useState } from "react";
import Link from "next/link";
import { RewardsStoreClient } from "@/components/rewards-store-client";

interface EventItem {
  id: string;
  title: string;
  description: string;
  coverCloudinaryUrl: string | null;
  eventAt: string;
  cafe: {
    slug: string;
    name: string;
  };
}

interface DealItem {
  id: string;
  title: string;
  description: string;
  terms: string | null;
  endsAt: string;
  cafe: {
    slug: string;
    name: string;
  };
}

interface RedeemedVoucherItem {
  id: string;
  claimCode: string;
  isUsed: boolean;
  redeemedAt: string;
  usedAt: string | null;
  voucher: {
    title: string;
    description: string;
    cafe: {
      name: string;
      address: string;
    };
  };
}

interface UserSummary {
  id: string;
  points: number;
  level: string;
}

interface EventsAndDealsClientProps {
  user: UserSummary | null;
  events: EventItem[];
  deals: DealItem[];
  vouchers: any[];
  quests: any[];
  redemptions: RedeemedVoucherItem[];
}

export function EventsAndDealsClient({
  user,
  events,
  deals,
  vouchers,
  quests,
  redemptions,
}: EventsAndDealsClientProps) {
  const [activeTab, setActiveTab] = useState<"deals" | "rewards" | "vouchers">("deals");

  const tabClass = (tab: typeof activeTab) =>
    `pb-4 text-center font-black border-b-2 text-sm md:text-base transition whitespace-nowrap px-4 ${
      activeTab === tab
        ? "border-[#ff6679] text-[#ff6679]"
        : "border-transparent text-[#756a7d] hover:text-[#21152d]"
    }`;

  const activeVouchers = redemptions.filter((r) => !r.isUsed);
  const usedVouchers = redemptions.filter((r) => r.isUsed);

  return (
    <div className="space-y-10">
      {/* Tabs Menu */}
      <div className="border-b border-[#e7dff0] flex justify-center">
        <nav className="flex gap-4 md:gap-8 overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab("deals")} className={tabClass("deals")}>
            📅 Events & Flash Deals
          </button>
          <button onClick={() => setActiveTab("rewards")} className={tabClass("rewards")}>
            🎁 Rewards Store
          </button>
          <button onClick={() => setActiveTab("vouchers")} className={tabClass("vouchers")}>
            🎫 My Vouchers ({user ? activeVouchers.length : 0})
          </button>
        </nav>
      </div>

      {/* Content Switcher */}
      <section className="mx-auto max-w-7xl">
        {/* EVENTS AND DEALS TAB */}
        {activeTab === "deals" && (
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
                    <div
                      key={event.id}
                      className="rounded-3xl bg-white p-6 card-shadow border border-[#e7dff0]/50 flex flex-col justify-between"
                    >
                      <div>
                        {event.coverCloudinaryUrl && (
                          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#e7dff0] mb-4">
                            <img
                              src={event.coverCloudinaryUrl}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <Link
                          href={`/cafes/${event.cafe.slug}`}
                          className="text-xs font-bold uppercase tracking-wider text-[#ff6679] hover:underline"
                        >
                          📍 {event.cafe.name}
                        </Link>
                        <h3 className="text-xl font-black text-[#21152d] mt-1.5">{event.title}</h3>
                        <p className="text-sm text-[#564b60] mt-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      <div className="mt-6 border-t border-[#f4eff9] pt-4 flex items-center justify-between">
                        <span className="text-xs font-black text-[#7441b5] bg-[#f4eff9] px-3 py-1.5 rounded-xl">
                          🕒{" "}
                          {new Date(event.eventAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <Link
                          href={`/cafes/${event.cafe.slug}`}
                          className="text-xs font-black text-[#21152d] hover:translate-x-0.5 transition-transform"
                        >
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
                    <div
                      key={deal.id}
                      className="rounded-3xl bg-gradient-to-br from-[#21152d] to-[#3a1d4d] text-white p-6 card-shadow relative overflow-hidden flex flex-col justify-between min-h-[200px]"
                    >
                      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#ff6679] to-[#7441b5] opacity-20 blur-3xl pointer-events-none" />
                      <div>
                        <Link
                          href={`/cafes/${deal.cafe.slug}`}
                          className="text-xs font-bold uppercase tracking-wider text-[#c9ff4d] hover:underline"
                        >
                          📍 {deal.cafe.name}
                        </Link>
                        <h3 className="text-xl font-black text-white mt-2">{deal.title}</h3>
                        <p className="text-sm text-white/70 mt-2 leading-relaxed">
                          {deal.description}
                        </p>
                        {deal.terms && (
                          <p className="text-[11px] text-white/40 mt-2 italic">
                            Terms: {deal.terms}
                          </p>
                        )}
                      </div>
                      <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase bg-[#ff6679] text-white px-2.5 py-1 rounded-lg">
                          Ends: {new Date(deal.endsAt).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/cafes/${deal.cafe.slug}`}
                          className="text-xs font-black text-[#c9ff4d] hover:underline"
                        >
                          Redeem Deal →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REWARDS STORE TAB */}
        {activeTab === "rewards" && (
          <div>
            {user ? (
              <RewardsStoreClient
                user={user}
                initialVouchers={vouchers}
                initialQuests={quests}
              />
            ) : (
              <GuestLoginCta />
            )}
          </div>
        )}

        {/* MY VOUCHERS TAB */}
        {activeTab === "vouchers" && (
          <div>
            {user ? (
              <div className="mx-auto max-w-4xl space-y-10">
                {/* Active Tickets */}
                <section className="space-y-6">
                  <h3 className="text-xl font-black">Active Vouchers ({activeVouchers.length})</h3>

                  {activeVouchers.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
                      <p className="font-bold text-[#756a7d]">You don't have any active vouchers.</p>
                      <button
                        onClick={() => setActiveTab("rewards")}
                        className="mt-4 inline-block bg-[#7441b5] text-white font-extrabold text-xs py-3 px-5 rounded-xl hover:bg-[#5f32c4] transition"
                      >
                        Browse Rewards Store
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {activeVouchers.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-[1.8rem] bg-white border border-[#e7dff0] overflow-hidden card-shadow flex flex-col justify-between"
                        >
                          <div className="p-6 space-y-4">
                            <div className="border-b border-[#f4eff9] pb-3">
                              <p className="text-xs font-black uppercase text-[#ff6679] tracking-wider">
                                {r.voucher.cafe.name}
                              </p>
                              <p className="text-[10px] text-[#756a7d] mt-0.5">
                                {r.voucher.cafe.address}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-lg font-black text-[#21152d]">
                                {r.voucher.title}
                              </h4>
                              <p className="text-xs text-[#564b60] mt-1">
                                {r.voucher.description}
                              </p>
                            </div>
                          </div>

                          {/* Coupon claim ticket barcode area */}
                          <div className="bg-[#fcfaff] border-t border-dashed border-[#e7dff0] p-6 text-center space-y-2 relative">
                            {/* Visual coupon cutout notches */}
                            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbf9ff] border-r border-[#e7dff0]" />
                            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbf9ff] border-l border-[#e7dff0]" />

                            <p className="text-[10px] font-black uppercase tracking-widest text-[#756a7d]">
                              Voucher Claim Code
                            </p>
                            <p className="text-2xl font-black tracking-widest text-[#7441b5] select-all bg-white py-2 px-4 border border-[#e7dff0] rounded-xl w-fit mx-auto">
                              {r.claimCode}
                            </p>
                            <p className="text-[9px] text-[#756a7d] font-semibold">
                              Claimed on: {new Date(r.redeemedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Used/Past Tickets History */}
                {usedVouchers.length > 0 && (
                  <section className="mt-14 space-y-4">
                    <h3 className="text-xl font-black text-[#756a7d]">
                      Redemption History ({usedVouchers.length})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {usedVouchers.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-[1.6rem] bg-[#fbf9ff] border border-[#e7dff0]/60 p-5 flex justify-between items-center opacity-70"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase text-[#756a7d]">
                              {r.voucher.cafe.name}
                            </p>
                            <h4 className="text-sm font-black text-[#21152d]">{r.voucher.title}</h4>
                            <p className="text-[10px] text-[#756a7d]">
                              Redeemed:{" "}
                              {r.usedAt
                                ? new Date(r.usedAt).toLocaleDateString()
                                : new Date(r.redeemedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-200 text-slate-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                            USED
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <GuestLoginCta />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function GuestLoginCta() {
  return (
    <div className="rounded-[2.5rem] bg-gradient-to-br from-[#7441b5] to-[#21152d] p-8 md:p-12 text-white card-shadow text-center max-w-2xl mx-auto space-y-6">
      <span className="text-6xl block">🔒</span>
      <h2 className="text-3xl font-black">Members-Only Perks</h2>
      <p className="text-white/75 text-sm md:text-base leading-relaxed">
        Unlock the Rewards Store and view your active claimed vouchers by joining the VibeCheck
        community. Review cafes, verify bills, and redeem VibePoints!
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link
          href="/auth/signin"
          className="rounded-2xl bg-[#c9ff4d] hover:bg-[#b2e240] text-[#21152d] px-7 py-3.5 font-extrabold text-sm transition"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="rounded-2xl bg-[#ff6679] hover:bg-[#eb4e64] text-white px-7 py-3.5 font-extrabold text-sm transition"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
