"use client";

import { useState } from "react";
import Link from "next/link";

interface AdminStats {
  totalCafes: number;
  totalUsers: number;
  totalReviews: number;
}

interface ReceiptItem {
  id: string;
  authorEmail: string;
  cafeName: string;
  rating: number;
  body: string;
  receiptUrl: string;
  uploadedAt: string;
}

interface ClaimItem {
  id: string;
  requesterEmail: string;
  cafeName: string;
  cafeAddress: string;
  createdAt: string;
}

interface ReportItem {
  id: string;
  reason: string;
  reporterEmail: string;
  reviewId: string;
  reviewAuthorEmail: string;
  reviewBody: string;
  cafeName: string;
  createdAt: string;
}

interface CafeListingItem {
  id: string;
  name: string;
  address: string;
  ownerEmail: string;
  businessProofUrl: string;
  createdAt: string;
}

interface AdminModerationHubProps {
  stats: AdminStats;
  initialReceipts: ReceiptItem[];
  initialClaims: ClaimItem[];
  initialReports: ReportItem[];
  initialCafes: CafeListingItem[];
}


export function AdminModerationHub({ stats, initialReceipts, initialClaims, initialReports, initialCafes }: AdminModerationHubProps) {
  const [activeTab, setActiveTab] = useState<"receipts" | "reports" | "claims" | "cafes">("receipts");
  const [receipts, setReceipts] = useState<ReceiptItem[]>(initialReceipts);
  const [claims, setClaims] = useState<ClaimItem[]>(initialClaims);
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [cafes, setCafes] = useState<CafeListingItem[]>(initialCafes);
  const [actioningId, setActioningId] = useState<string | null>(null);
  
  // Lightbox modal for full size receipt view
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  async function handleReceiptAction(reviewId: string, action: "VERIFY" | "REJECT") {
    setActioningId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to process receipt action");
        return;
      }

      // Remove from list
      setReceipts(current => current.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Error contacting server");
    } finally {
      setActioningId(null);
    }
  }

  async function handleClaimAction(claimId: string, action: "APPROVE" | "REJECT") {
    setActioningId(claimId);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to process claim action");
        return;
      }

      // Remove from list
      setClaims(current => current.filter(c => c.id !== claimId));
    } catch (err) {
      console.error(err);
      alert("Error contacting server");
    } finally {
      setActioningId(null);
    }
  }

  async function handleCafeAction(cafeId: string, action: "APPROVE" | "REJECT") {
    setActioningId(cafeId);
    try {
      const res = await fetch("/api/admin/cafes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeId, action })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to process cafe action");
        return;
      }

      // Remove from list
      setCafes(current => current.filter(c => c.id !== cafeId));
    } catch (err) {
      console.error(err);
      alert("Error contacting server");
    } finally {
      setActioningId(null);
    }
  }


  async function handleReportAction(reportId: string, action: "RESOLVE_KEEP" | "RESOLVE_REMOVE") {
    setActioningId(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to process report action");
        return;
      }

      // Remove from list
      setReports(current => current.filter(r => r.id !== reportId));
    } catch (err) {
      console.error(err);
      alert("Error contacting server");
    } finally {
      setActioningId(null);
    }
  }

  const tabClass = (tab: typeof activeTab) => 
    `flex-1 pb-4 text-center font-black border-b-2 text-sm md:text-base transition ${
      activeTab === tab 
        ? "border-[#ff6679] text-[#ff6679]" 
        : "border-transparent text-[#756a7d] hover:text-[#21152d]"
    }`;

  return (
    <div className="space-y-8">
      
      {/* Stats Section */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Cafes", value: stats.totalCafes, color: "from-[#8e7dff] to-[#5f32c4]" },
          { label: "Total Users", value: stats.totalUsers, color: "from-[#ff9a8b] to-[#ff6a88]" },
          { label: "Total Reviews", value: stats.totalReviews, color: "from-[#ff6679] to-[#21152d]" }
        ].map(s => (
          <div key={s.label} className="rounded-3xl bg-white p-6 card-shadow border border-[#e7dff0]">
            <p className="text-xs font-black uppercase tracking-wider text-[#756a7d]">{s.label}</p>
            <p className="mt-3 text-4xl font-black text-[#21152d]">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="border-b border-[#e7dff0]">
        <nav className="flex gap-4 max-w-xl mx-auto">
          <button onClick={() => setActiveTab("receipts")} className={tabClass("receipts")}>
            Reviews ({receipts.length})
          </button>
          <button onClick={() => setActiveTab("reports")} className={tabClass("reports")}>
            Reports ({reports.length})
          </button>
          <button onClick={() => setActiveTab("claims")} className={tabClass("claims")}>
            Claims ({claims.length})
          </button>
          <button onClick={() => setActiveTab("cafes")} className={tabClass("cafes")}>
            Listings ({cafes.length})
          </button>
        </nav>
      </div>

      {/* Active Tab Queue */}
      <section className="mx-auto max-w-5xl">
        
        {/* RECEIPTS QUEUE */}
        {activeTab === "receipts" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black mb-4">Review Approval Queue ({receipts.length})</h3>
            {receipts.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
                <p className="font-bold text-[#756a7d]">Review queue is empty. Good job!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {receipts.map(r => (
                  <div key={r.id} className="rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow grid md:grid-cols-[1fr_220px] gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-xs text-[#756a7d] font-bold">Reviewer: {r.authorEmail}</p>
                          <p className="text-sm font-black text-[#7441b5] mt-0.5">Cafe: {r.cafeName}</p>
                        </div>
                        <span className="text-xs font-black text-[#7441b5] bg-[#f4eff9] px-2.5 py-1 rounded-full">
                          ★ {r.rating} stars
                        </span>
                      </div>
                      
                      <div className="bg-[#fbf9ff] p-4 rounded-xl border border-[#e7dff0]/60 text-sm italic text-[#564b60]">
                        "{r.body || "No text body provided."}"
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          disabled={actioningId === r.id}
                          onClick={() => handleReceiptAction(r.id, "VERIFY")}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                        >
                          Approve Review
                        </button>
                        <button
                          disabled={actioningId === r.id}
                          onClick={() => handleReceiptAction(r.id, "REJECT")}
                          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                        >
                          Reject Review
                        </button>
                      </div>
                    </div>

                    {/* Receipt / Bill Thumbnail */}
                    <div className="flex flex-col justify-center items-center">
                      {r.receiptUrl ? (
                        <button 
                          onClick={() => setLightboxUrl(r.receiptUrl)} 
                          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 border border-[#e7dff0] flex items-center justify-center hover:opacity-95 transition group"
                        >
                          <img src={r.receiptUrl} alt="receipt bill" className="max-h-full max-w-full object-contain" />
                          <span className="absolute inset-0 bg-black/40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            🔍 Zoom Bill Photo
                          </span>
                        </button>
                      ) : (
                        <div className="w-full aspect-[4/3] rounded-2xl border border-dashed border-[#e7dff0] bg-[#fbf9ff] flex flex-col items-center justify-center text-[#756a7d] p-3 text-center">
                          <span className="text-xl">📄</span>
                          <span className="text-[10px] font-bold mt-1">No Bill Uploaded</span>
                        </div>
                      )}
                      <span className="text-[10px] text-[#756a7d] font-semibold mt-2">
                        Uploaded: {new Date(r.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS QUEUE */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black mb-4">Flagged Review Reports ({reports.length})</h3>
            {reports.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
                <p className="font-bold text-[#756a7d]">No reviews are currently flagged. Awesome!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map(r => (
                  <div key={r.id} className="rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-2 border-b border-[#e7dff0] pb-3">
                      <div>
                        <p className="text-xs font-bold text-red-600">⚠️ Reported by: {r.reporterEmail}</p>
                        <p className="text-sm font-black text-[#21152d] mt-1">Reason: {r.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#756a7d]">
                        Reported: {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[#756a7d] font-bold">Review Target (by {r.reviewAuthorEmail} at {r.cafeName}):</p>
                      <div className="bg-[#fbf9ff] p-4 rounded-xl border border-[#e7dff0]/60 text-sm italic text-[#564b60]">
                        "{r.reviewBody || "No text provided."}"
                      </div>
                    </div>

                    <div className="flex gap-2 max-w-md">
                      <button
                        disabled={actioningId === r.id}
                        onClick={() => handleReportAction(r.id, "RESOLVE_KEEP")}
                        className="flex-1 bg-slate-500 hover:bg-slate-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                      >
                        Keep Review (Dismiss Report)
                      </button>
                      <button
                        disabled={actioningId === r.id}
                        onClick={() => handleReportAction(r.id, "RESOLVE_REMOVE")}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                      >
                        Delete Review (Resolve Report)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CLAIMS QUEUE */}
        {activeTab === "claims" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black mb-4">Cafe Claim Requests ({claims.length})</h3>
            {claims.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
                <p className="font-bold text-[#756a7d]">No cafe claim requests pending.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {claims.map(c => (
                  <div key={c.id} className="rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow space-y-4">
                    <div>
                      <p className="text-xs text-[#756a7d] font-bold">Claimant: {c.requesterEmail}</p>
                      <h4 className="text-lg font-black text-[#21152d] mt-1">Cafe: {c.cafeName}</h4>
                      <p className="text-xs text-[#756a7d] mt-0.5">Address: {c.cafeAddress}</p>
                    </div>

                    <div className="flex gap-2 max-w-sm">
                      <button
                        disabled={actioningId === c.id}
                        onClick={() => handleClaimAction(c.id, "APPROVE")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition"
                      >
                        Approve Claim
                      </button>
                      <button
                        disabled={actioningId === c.id}
                        onClick={() => handleClaimAction(c.id, "REJECT")}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CAFES QUEUE */}
        {activeTab === "cafes" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black mb-4">Pending Cafe Listings ({cafes.length})</h3>
            {cafes.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-[#e7dff0] card-shadow">
                <p className="font-bold text-[#756a7d]">No new cafe registrations are pending. Clean board!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {cafes.map(c => (
                  <div key={c.id} className="rounded-3xl bg-white border border-[#e7dff0] p-6 card-shadow grid md:grid-cols-[1fr_220px] gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-[#756a7d] font-bold">Owner Registered: {c.ownerEmail}</p>
                        <h4 className="text-lg font-black text-[#7441b5] mt-0.5">{c.name}</h4>
                        <p className="text-xs text-[#756a7d] mt-0.5">{c.address}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          disabled={actioningId === c.id}
                          onClick={() => handleCafeAction(c.id, "APPROVE")}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                        >
                          Approve Listing
                        </button>
                        <button
                          disabled={actioningId === c.id}
                          onClick={() => handleCafeAction(c.id, "REJECT")}
                          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition"
                        >
                          Reject & Delete
                        </button>
                      </div>
                    </div>

                    {/* Verification Document Preview */}
                    <div className="flex flex-col justify-center items-center">
                      <button 
                        onClick={() => setLightboxUrl(c.businessProofUrl)} 
                        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 border border-[#e7dff0] flex items-center justify-center hover:opacity-95 transition group"
                      >
                        <img src={c.businessProofUrl} alt="business proof document" className="max-h-full max-w-full object-contain" />
                        <span className="absolute inset-0 bg-black/40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          🔍 Zoom Document
                        </span>
                      </button>
                      <span className="text-[10px] text-[#756a7d] font-semibold mt-2">
                        Submitted: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div 
          onClick={() => setLightboxUrl(null)} 
          className="fixed inset-0 z-[100] grid place-items-center bg-[#171020]/90 p-5 cursor-zoom-out backdrop-blur-sm"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
            <img src={lightboxUrl} alt="Enlarged receipt" className="max-h-[80vh] object-contain rounded-xl" />
            <button 
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-[#171020] text-white rounded-full p-2.5 font-bold text-xs"
            >
              Close Zoom
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
