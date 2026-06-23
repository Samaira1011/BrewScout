"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function CashierCheckoutPage() {
  const [claimCode, setClaimCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    userEmail: string;
    voucherTitle: string;
    cafeName: string;
  } | null>(null);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/vouchers/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");

      setResult(data);
      setClaimCode(""); // clear input for next checkout
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to validate code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-2xl bg-white p-8 rounded-[2rem] card-shadow border border-[#e7dff0]">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e7dff0] pb-6 mb-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">
              Business Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Voucher Checkout Portal
            </h1>
            <p className="mt-2 text-sm text-[#756a7d]">
              Key in customer claim codes to validate and redeem their vouchers.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#e7dff0] bg-white px-5 py-3.5 font-bold text-[#564b60] hover:bg-[#fbf9ff] shrink-0"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <label className="block text-sm font-bold">Customer Claim Code
            <input
              required
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-5 py-4 text-center text-2xl font-black uppercase tracking-widest outline-[#7441b5] text-[#7441b5] bg-[#fbf9ff]"
              placeholder="VIBE-XXXXXX"
            />
          </label>

          <button
            disabled={loading || !claimCode.trim()}
            type="submit"
            className="w-full rounded-xl bg-[#21152d] hover:bg-[#171020] disabled:opacity-50 text-white font-extrabold text-sm py-4 px-6 transition shadow"
          >
            {loading ? "Validating..." : "Verify & Redeem Voucher"}
          </button>
        </form>

        {/* Result States */}
        <div className="mt-8">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-center text-red-800 space-y-2">
              <span className="text-3xl">❌</span>
              <h4 className="font-black">Redemption Failed</h4>
              <p className="text-xs font-semibold opacity-90">{error}</p>
            </div>
          )}

          {result && (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center text-green-800 space-y-4 animate-fade-in">
              <span className="text-4xl">🎉</span>
              <div>
                <h4 className="font-black text-lg">Voucher Successfully Redeemed!</h4>
                <p className="text-xs opacity-90 mt-1">This code has been marked as used and cannot be claimed again.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-green-200/50 text-left text-xs font-medium space-y-2 text-[#21152d]">
                <div className="flex justify-between">
                  <span className="text-[#756a7d]">Cafe Location:</span>
                  <span className="font-bold">{result.cafeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#756a7d]">Discount/Offer:</span>
                  <span className="font-bold text-[#7441b5]">{result.voucherTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#756a7d]">Redeemed By:</span>
                  <span className="font-bold">{result.userEmail}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
