import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyVouchersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch claimed vouchers
  const redemptions = await prisma.redeemedVoucher.findMany({
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

  const activeVouchers = redemptions.filter(r => !r.isUsed);
  const usedVouchers = redemptions.filter(r => r.isUsed);

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e7dff0] pb-6 mb-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#ff6679]">
              My Account
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              My Rewards Vouchers
            </h1>
            <p className="mt-2 text-sm text-[#756a7d]">
              Present these codes at participating cafes to redeem your perks.
            </p>
          </div>
          <Link
            href="/rewards"
            className="rounded-xl border border-[#e7dff0] bg-white px-5 py-3.5 font-bold text-[#564b60] hover:bg-[#fbf9ff] shrink-0"
          >
            ← Rewards Store
          </Link>
        </div>

        {/* Active Tickets */}
        <section className="space-y-6">
          <h3 className="text-xl font-black">Active Vouchers ({activeVouchers.length})</h3>
          
          {activeVouchers.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
              <p className="font-bold text-[#756a7d]">You don't have any active vouchers.</p>
              <Link href="/rewards" className="mt-4 inline-block bg-[#7441b5] text-white font-extrabold text-xs py-3 px-5 rounded-xl hover:bg-[#5f32c4] transition">
                Browse Rewards Store
              </Link>
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
                      <p className="text-[10px] text-[#756a7d] mt-0.5">{r.voucher.cafe.address}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-[#21152d]">{r.voucher.title}</h4>
                      <p className="text-xs text-[#564b60] mt-1">{r.voucher.description}</p>
                    </div>
                  </div>

                  {/* Coupon claim ticket barcode area */}
                  <div className="bg-[#fcfaff] border-t border-dashed border-[#e7dff0] p-6 text-center space-y-2 relative">
                    {/* Visual coupon cutout notches */}
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbf9ff] border-r border-[#e7dff0]" />
                    <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbf9ff] border-l border-[#e7dff0]" />
                    
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#756a7d]">Voucher Claim Code</p>
                    <p className="text-2xl font-black tracking-widest text-[#7441b5] select-all bg-white py-2 px-4 border border-[#e7dff0] rounded-xl w-fit mx-auto">
                      {r.claimCode}
                    </p>
                    <p className="text-[9px] text-[#756a7d] font-semibold">Claimed on: {r.redeemedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Used/Past Tickets History */}
        {usedVouchers.length > 0 && (
          <section className="mt-14 space-y-4">
            <h3 className="text-xl font-black text-[#756a7d]">Redemption History ({usedVouchers.length})</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {usedVouchers.map((r) => (
                <div 
                  key={r.id} 
                  className="rounded-[1.6rem] bg-[#fbf9ff] border border-[#e7dff0]/60 p-5 flex justify-between items-center opacity-70"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-[#756a7d]">{r.voucher.cafe.name}</p>
                    <h4 className="text-sm font-black text-[#21152d]">{r.voucher.title}</h4>
                    <p className="text-[10px] text-[#756a7d]">Redeemed: {r.usedAt?.toLocaleDateString() || r.redeemedAt.toLocaleDateString()}</p>
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
    </main>
  );
}
