"use client";

import { useState } from "react";
import Link from "next/link";

interface Cafe {
  name: string;
}

interface Voucher {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  cafe: Cafe;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  bonusPoints: number;
  endsAt: string;
  cafe: Cafe;
}

interface UserSummary {
  id: string;
  points: number;
  level: string;
}

interface RewardsStoreClientProps {
  user: UserSummary;
  initialVouchers: any[];
  initialQuests: any[];
}

export function RewardsStoreClient({ user, initialVouchers, initialQuests }: RewardsStoreClientProps) {
  const [points, setPoints] = useState(user.points);
  const [level, setLevel] = useState(user.level);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);
  const [claimedTitle, setClaimedTitle] = useState("");

  const handleClaim = async (voucherId: string, cost: number, title: string) => {
    if (points < cost) return;
    setLoadingId(voucherId);
    setClaimedCode(null);

    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");

      // Update points and level locally
      const remainingPoints = points - cost;
      setPoints(remainingPoints);
      
      let nextLevel = "BRONZE";
      if (remainingPoints >= 500) nextLevel = "GOLD";
      else if (remainingPoints >= 200) nextLevel = "SILVER";
      setLevel(nextLevel);

      setClaimedCode(data.claimCode);
      setClaimedTitle(title);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to redeem reward");
    } finally {
      setLoadingId(null);
    }
  };

  const getTierColor = (lvl: string) => {
    switch (lvl) {
      case "GOLD": return "bg-amber-400 text-amber-950 border-amber-300";
      case "SILVER": return "bg-slate-300 text-slate-900 border-slate-200";
      default: return "bg-amber-700 text-amber-50 border-amber-800";
    }
  };

  const nextTierPoints = level === "BRONZE" ? 200 : level === "SILVER" ? 500 : 0;
  const progressPercent = nextTierPoints ? Math.min(100, Math.floor((points / nextTierPoints) * 100)) : 100;

  return (
    <div className="space-y-10">
      {/* Point Balance Panel */}
      <section className="rounded-[2.5rem] bg-gradient-to-br from-[#7441b5] to-[#21152d] p-8 md:p-12 text-white card-shadow border border-[#7441b5]/30 grid md:grid-cols-[1fr_280px] gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getTierColor(level)}`}>
              {level} Tier Member
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black">Your VibePoints</h2>
          <p className="text-white/70 text-sm md:text-base max-w-md">
            Review cafes and verify receipts to earn points, then redeem them for exclusive local coffeeshop rewards.
          </p>
          
          {nextTierPoints > 0 && (
            <div className="space-y-1.5 pt-2 max-w-md">
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>Next Tier: {level === "BRONZE" ? "SILVER" : "GOLD"}</span>
                <span>{points} / {nextTierPoints} PTS</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#c9ff4d] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/10 rounded-3xl p-6 border border-white/5 text-center flex flex-col justify-center items-center">
          <span className="text-6xl font-black text-[#c9ff4d]">{points}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 mt-2">Available Balance</span>
          <Link href="/profile/vouchers" className="mt-5 w-full bg-[#ff6679] hover:bg-[#eb4e64] text-white font-extrabold text-xs py-3 px-4 rounded-xl transition">
            My Claimed Vouchers →
          </Link>
        </div>
      </section>

      {/* Claim Success Banner */}
      {claimedCode && (
        <section className="rounded-3xl bg-green-500 text-white p-6 card-shadow border border-green-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-green-950 bg-green-200 px-2 py-0.5 rounded">Success</span>
            <h3 className="text-xl font-black mt-1">Claimed: {claimedTitle}</h3>
            <p className="text-sm text-white/80 mt-1">Show this voucher code at checkout to claim your reward:</p>
            <p className="text-2xl font-black tracking-widest text-[#c9ff4d] mt-2 bg-black/20 px-4 py-2 rounded-xl w-fit">{claimedCode}</p>
          </div>
          <Link href="/profile/vouchers" className="bg-white text-green-900 font-extrabold text-sm py-3 px-6 rounded-xl shrink-0 hover:bg-slate-100 transition shadow">
            View My Vouchers
          </Link>
        </section>
      )}

      {/* Point Quests */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#ff6679]">Sponsorships</p>
          <h3 className="text-2xl font-black">Sponsored Point Quests</h3>
        </div>
        
        {initialQuests.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 border border-[#e7dff0] text-center text-[#756a7d] text-sm">
            No sponsored quests active right now. Check back soon!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {initialQuests.map((quest) => (
              <div key={quest.id} className="rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#7441b5] bg-[#f4eff9] px-2 py-0.5 rounded">
                    Quest at {quest.cafe.name}
                  </span>
                  <h4 className="font-black text-lg text-[#21152d]">{quest.title}</h4>
                  <p className="text-xs text-[#564b60] leading-relaxed">{quest.description}</p>
                  <p className="text-[10px] text-[#756a7d] font-semibold">Ends: {new Date(quest.endsAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-[#c9ff4d] text-[#21152d] font-black text-xs px-3 py-2 rounded-full shrink-0">
                  +{quest.bonusPoints} PTS
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rewards Vouchers */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#7441b5]">Catalog</p>
          <h3 className="text-2xl font-black">Redeem Rewards Vouchers</h3>
        </div>

        {vouchers.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-14 text-center border border-[#e7dff0] card-shadow">
            <h3 className="text-xl font-black">No rewards listed yet</h3>
            <p className="mt-2 text-[#756a7d] text-sm">Check back later as our partner cafes post discount offers.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vouchers.map((v) => {
              const locked = points < v.pointsCost;
              return (
                <div 
                  key={v.id} 
                  className={`rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow flex flex-col justify-between ${
                    locked ? "opacity-75" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-[#7441b5]">{v.cafe.name}</span>
                      <span className="text-xs font-black text-[#c9ff4d] bg-[#21152d] px-2.5 py-1 rounded-full shrink-0">
                        {v.pointsCost} PTS
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-black text-[#21152d] leading-snug">{v.title}</h4>
                    <p className="text-xs text-[#564b60] leading-relaxed">{v.description}</p>
                  </div>

                  <button
                    disabled={locked || loadingId === v.id}
                    onClick={() => handleClaim(v.id, v.pointsCost, v.title)}
                    className={`mt-6 w-full font-black text-xs py-3 px-4 rounded-xl transition ${
                      locked 
                        ? "bg-[#f4eff9] text-[#756a7d] cursor-not-allowed" 
                        : "bg-[#21152d] hover:bg-[#171020] text-white"
                    }`}
                  >
                    {loadingId === v.id ? "Redeeming..." : locked ? "🔒 Insufficient Points" : "Claim Offer"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
