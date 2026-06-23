"use client";

import { useState } from "react";
import Link from "next/link";

interface MappedReview {
  id: string;
  cafeName: string;
  cafeSlug: string;
  rating: number;
  body: string;
  isVerified: boolean;
  hasReceipt: boolean;
  receiptUrl: string | null;
  createdAt: string;
}

export function ProfileReviewsList({ initialReviews }: { initialReviews: MappedReview[] }) {
  const [reviews, setReviews] = useState<MappedReview[]>(initialReviews);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleReceiptId, setVisibleReceiptId] = useState<string | null>(null);

  async function handleDelete(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review? This will also remove the verified badge and adjust the café's average rating.")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete review");
        return;
      }

      // Remove from list
      setReviews(current => current.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error("Delete review error:", err);
      alert("Failed to delete review due to network error.");
    } finally {
      setDeletingId(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-[#e7dff0] rounded-2xl bg-white/50">
        <p className="font-bold text-[#756a7d]">You haven't written any reviews yet.</p>
        <Link href="/search" className="mt-4 inline-block rounded-full bg-[#7441b5] hover:bg-[#5f32c4] text-white px-5 py-2.5 text-xs font-bold transition">
          Find a café to review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <article key={review.id} className="rounded-2xl border border-[#e7dff0] p-6 hover:shadow-sm transition bg-[#fcfaff] space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <Link href={`/cafes/${review.cafeSlug}`} className="text-lg font-black hover:text-[#7441b5] transition">
                {review.cafeName}
              </Link>
              <div className="flex gap-2 items-center flex-wrap mt-1">
                <span className="text-[#7441b5] font-bold">{"★".repeat(review.rating)}</span>
                <span className="text-xs text-[#756a7d]">·</span>
                <span className="text-xs text-[#756a7d]">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {review.hasReceipt && review.receiptUrl && (
                <button
                  onClick={() => setVisibleReceiptId(current => current === review.id ? null : review.id)}
                  className="rounded-lg bg-[#f4eff9] hover:bg-[#e7dff0] px-3 py-1.5 text-xs font-bold text-[#7441b5] transition"
                >
                  {visibleReceiptId === review.id ? "Hide Receipt" : "View Receipt"}
                </button>
              )}
              <button
                disabled={deletingId === review.id}
                onClick={() => handleDelete(review.id)}
                className="rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-red-600 transition"
              >
                {deletingId === review.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {review.isVerified ? (
              <span className="rounded-full bg-[#c9ff4d] text-[#21152d] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                ✓ Receipt Verified
              </span>
            ) : review.hasReceipt ? (
              <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                ⌛ Verification Pending
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                ✕ Unverified Visit
              </span>
            )}
          </div>

          {/* Review Body */}
          <p className="text-sm leading-relaxed text-[#564b60] bg-white p-3.5 rounded-xl border border-[#e7dff0]/50 whitespace-pre-wrap">
            {review.body || <span className="italic text-[#756a7d]">No review description provided.</span>}
          </p>

          {/* Receipt View Drawer */}
          {visibleReceiptId === review.id && review.receiptUrl && (
            <div className="mt-4 border border-[#e7dff0] rounded-xl p-4 bg-white space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#756a7d]">Submitted Receipt Document</p>
              <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg bg-black/5 border border-[#e7dff0] flex items-center justify-center mx-auto">
                <img 
                  src={review.receiptUrl} 
                  alt="Scanned receipt bill" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

        </article>
      ))}
    </div>
  );
}
