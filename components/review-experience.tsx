"use client";

import { FormEvent, useEffect, useState } from "react";
import { CameraCapture } from "./camera-capture";
import { SideBySidePreview } from "./side-by-side-preview";

type Review = { 
  author: string; 
  rating: number; 
  verified: boolean; 
  body: string; 
  date: string; 
  receiptUrl?: string | null;
  photos?: string[];
  reply?: {
    body: string;
    date: string;
  } | null;
};

export function ReviewExperience({ slug, initialReviews }: { slug: string; initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  
  // Verification Wizard State
  const [verifyVisit, setVerifyVisit] = useState(false);
  const [receiptStep, setReceiptStep] = useState(0); // 0: unstarted, 1: waiver, 2: camera/upload, 3: completed
  const [signature, setSignature] = useState("");
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null); // base64
  const [reviewImages, setReviewImages] = useState<string[]>([]); // array of base64
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clickable Side-by-Side Previewer State
  const [previewingImages, setPreviewingImages] = useState<string[] | null>(null);
  const [previewingInitialIndex, setPreviewingInitialIndex] = useState<number>(0);

  const triggerPreview = (clickedImage: string) => {
    const list: string[] = [];
    if (receiptImage) list.push(receiptImage);
    reviewImages.forEach(img => list.push(img));

    const idx = list.indexOf(clickedImage);
    setPreviewingImages(list);
    setPreviewingInitialIndex(idx >= 0 ? idx : 0);
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const processReviewFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewImages(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleReviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      processReviewFile(files[i]);
    }
  };

  const handleReviewPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processReviewFile(file);
        }
      }
    }
  };

  useEffect(() => setVerifiedOnly(sessionStorage.getItem("verifiedOnly") === "true"), []);

  function toggleVerified() {
    setVerifiedOnly(value => {
      sessionStorage.setItem("verifiedOnly", String(!value));
      return !value;
    });
  }

  // Reset wizard state when modal closes
  function closeModal() {
    setOpen(false);
    setVerifyVisit(false);
    setReceiptStep(0);
    setSignature("");
    setWaiverAgreed(false);
    setReceiptImage(null);
    setReviewImages([]);
    setPreviewingImages(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      let receiptUrl = null;

      // 1. If user opted to verify, upload the receipt first
      if (verifyVisit && receiptImage) {
        const uploadRes = await fetch("/api/uploads/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: receiptImage, signature }),
        });
        
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          alert(uploadErr.error || "Failed to upload receipt image.");
          setIsSubmitting(false);
          return;
        }

        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url;
      }

      // 2. Submit the review
      const res = await fetch(`/api/cafes/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body, receiptUrl, reviewImages }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to publish review");
        setIsSubmitting(false);
        return;
      }

      // Locally prepend review. Note: starts unverified (false) because admin must moderate the receipt
      setReviews(current => [
        { 
          author: "You", 
          rating, 
          verified: false, // Pending admin approval
          body, 
          receiptUrl: verifyVisit ? receiptImage : null,
          photos: reviewImages,
          date: "Just now (pending verification)" 
        }, 
        ...current
      ]);

      setBody("");
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleReviews = verifiedOnly ? reviews.filter(review => review.verified) : reviews;

  return <div className="mt-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">Real experiences</p><h2 className="mt-2 text-3xl font-black">What people say</h2></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={toggleVerified} className={`rounded-full px-5 py-3 text-sm font-bold ${verifiedOnly ? "bg-[#c9ff4d] text-[#21152d]" : "bg-white text-[#7441b5] card-shadow"}`}>{verifiedOnly ? "Showing verified only" : "Receipt-verified only"}</button>
        <button onClick={() => setOpen(true)} className="rounded-full bg-[#21152d] px-5 py-3 text-sm font-bold text-white">Write a review</button>
      </div>
    </div>
    <div className="mt-6 space-y-4">{visibleReviews.map((review, index) => <article key={`${review.author}-${index}`} className="rounded-[1.6rem] bg-white p-6 card-shadow">
      <div className="flex justify-between gap-5"><div><p className="font-black">{review.author}</p><p className="mt-1 text-sm text-[#756a7d]">{review.date}</p></div><p className="font-black text-[#7441b5]">{"★".repeat(review.rating)}</p></div>
      {review.verified && <span className="mt-4 inline-block rounded-full bg-[#c9ff4d] px-3 py-1 text-xs font-black">RECEIPT VERIFIED</span>}
      <p className="mt-4 leading-7 text-[#564b60]">{review.body}</p>
      
      {review.receiptUrl && (
        <div className="mt-4 flex flex-col items-start gap-2 border-t border-[#f4eff9] pt-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#756a7d]">Attached Bill / Receipt</span>
          <button 
            type="button"
            onClick={() => setLightboxUrl(review.receiptUrl || null)}
            className="relative w-32 aspect-[4/3] rounded-xl overflow-hidden bg-black/5 border border-[#e7dff0] flex items-center justify-center hover:opacity-90 transition group cursor-zoom-in"
          >
            <img src={review.receiptUrl} alt="Bill receipt" className="max-h-full max-w-full object-contain" />
            <span className="absolute inset-0 bg-black/40 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              🔍 Zoom Bill
            </span>
          </button>
        </div>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="mt-4 flex flex-col items-start gap-2 border-t border-[#f4eff9] pt-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#756a7d]">Attached Photos</span>
          <div className="flex flex-wrap gap-2">
            {review.photos.map((photoUrl, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setLightboxUrl(photoUrl)}
                className="relative w-20 aspect-square rounded-xl overflow-hidden bg-black/5 border border-[#e7dff0] flex items-center justify-center hover:opacity-90 transition group cursor-zoom-in"
              >
                <img src={photoUrl} alt="Review attachment" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/40 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  🔍 View
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {review.reply && (
        <div className="mt-4 border-l-4 border-[#7441b5] bg-[#fbf9ff] p-4 rounded-r-xl">
          <p className="font-black text-xs text-[#7441b5]">Owner Reply</p>
          <p className="mt-1 text-sm leading-6 text-[#564b60]">{review.reply.body}</p>
          <p className="mt-2 text-[10px] text-[#756a7d]">{review.reply.date}</p>
        </div>
      )}
    </article>)}</div>
    {!visibleReviews.length && <div className="mt-6 rounded-[1.6rem] bg-white p-8 text-center card-shadow"><p className="font-black">No receipt-verified reviews yet.</p></div>}

    {/* Lightbox Modal */}
    {lightboxUrl && (
      <div 
        onClick={() => setLightboxUrl(null)} 
        className="fixed inset-0 z-[100] grid place-items-center bg-[#171020]/90 p-5 cursor-zoom-out backdrop-blur-md transition-all duration-300"
      >
        <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
          <img src={lightboxUrl} alt="Enlarged bill receipt" className="max-h-[80vh] object-contain rounded-xl" />
          <button 
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 bg-[#171020] text-white rounded-full p-2.5 font-bold text-xs"
          >
            Close Zoom
          </button>
        </div>
      </div>
    )}

    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#171020]/70 p-5 backdrop-blur-sm overflow-y-auto" onClick={closeModal}>
      <form onSubmit={submit} onClick={event => event.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-7 card-shadow my-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">Share your experience</p>
            <h3 className="mt-2 text-3xl font-black">How was the vibe?</h3>
          </div>
          <button type="button" onClick={closeModal} className="rounded-full bg-[#f4eff9] hover:bg-[#e7dff0] px-4 py-2 font-black transition">×</button>
        </div>

        <label className="mt-6 block text-sm font-bold">Rating
          <select value={rating} onChange={event => setRating(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3">
            {[5,4,3,2,1].map(value => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </label>

        <label className="mt-4 block text-sm font-bold">Your review
          <textarea required maxLength={1000} value={body} onChange={event => setBody(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5]" placeholder="What stood out? (ambience, coffee, noise levels, seating...)" />
        </label>

        {/* Upload Review Photos (Multiple Allowed) */}
        <div className="mt-6 border-t border-[#e7dff0] pt-5 space-y-4">
          <div>
            <span className="block text-sm font-bold text-[#564b60]">Attach Photos to Review</span>
            <p className="text-xs text-[#756a7d] mt-0.5">Share photos of your coffee, food, or seat. You can also paste Ctrl+V here.</p>
          </div>

          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
            {/* Display Review Photo Previews */}
            {reviewImages.map((base64, index) => (
              <div 
                key={index} 
                onClick={() => triggerPreview(base64)}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#e7dff0] bg-black/5 group cursor-zoom-in"
              >
                <img src={base64} alt="Review item upload" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider transition">
                  🔍 Compare
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReviewImage(index);
                  }}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/75 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition z-10"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Review Photo Upload slot */}
            <label 
              tabIndex={0}
              onPaste={(e) => handleReviewPaste(e)}
              className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-[#7441b5]/30 bg-[#7441b5]/5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 text-center p-2 outline-none focus:ring-2 focus:ring-[#7441b5]"
            >
              <span className="text-lg">📸</span>
              <span className="text-[10px] mt-1">Add Photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleReviewFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Receipt Verification Wizard Switch */}
        <div className="mt-6 border-t border-[#e7dff0] pt-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f4eff9] p-4 text-sm font-bold">
            <input 
              type="checkbox" 
              checked={verifyVisit} 
              onChange={event => {
                const checked = event.target.checked;
                setVerifyVisit(checked);
                if (checked) {
                  setReceiptStep(1);
                } else {
                  setReceiptStep(0);
                  setReceiptImage(null);
                }
              }} 
              className="h-5 w-5 accent-[#7441b5]" 
            /> 
            Verify my visit with receipt (Get a Verified Badge)
          </label>
        </div>

        {/* Multi-step Receipt Wizard */}
        {verifyVisit && (
          <div className="mt-4 rounded-xl border border-[#e7dff0] p-4 bg-white space-y-4">
            
            {/* Step 1: Privacy Waiver */}
            {receiptStep === 1 && (
              <div className="space-y-4 text-[#21152d]">
                <div className="border-b border-[#e7dff0] pb-2">
                  <span className="text-xs font-black uppercase text-[#ff6679]">Step 1 of 2: Waiver & Terms</span>
                  <h4 className="text-base font-black">Receipt Verification Agreement</h4>
                </div>
                <div className="text-xs leading-relaxed text-[#756a7d] bg-[#f4eff9] p-3 rounded-lg border border-[#e7dff0]/50 max-h-32 overflow-y-auto space-y-2">
                  <p>1. <strong>Ownership:</strong> You certify that you are the authentic owner of this receipt and visited this café on the date specified on the receipt.</p>
                  <p>2. <strong>Waiver:</strong> You authorize VibeCheck and its administrators/AI processors to scan, read, and retain this receipt to verify details (e.g., café name, address, transaction date).</p>
                  <p>3. <strong>Privacy:</strong> You waive claims regarding data confidentiality of the receipt photo for validation. Sensitive payment details can be covered, but date and merchant name must be visible.</p>
                  <p>4. <strong>Falsification:</strong> Submitting forged or unrelated receipts violates community terms and results in immediate and permanent account suspension.</p>
                </div>
                
                <label className="block text-xs font-bold text-[#21152d]">
                  Type your signature (Full Legal Name)
                  <input 
                    type="text" 
                    required={verifyVisit}
                    placeholder="John Doe" 
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#e7dff0] px-3 py-2 text-sm outline-[#7441b5]"
                  />
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#564b60]">
                  <input 
                    type="checkbox" 
                    checked={waiverAgreed}
                    onChange={(e) => setWaiverAgreed(e.target.checked)}
                    className="h-4 w-4 accent-[#ff6679]"
                  />
                  I agree to the waiver terms above
                </label>

                <button
                  type="button"
                  disabled={!waiverAgreed || !signature.trim()}
                  onClick={() => setReceiptStep(2)}
                  className="w-full bg-[#7441b5] hover:bg-[#5f32c4] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Agree & Continue to Scanner
                </button>
              </div>
            )}

            {/* Step 2: Camera Capture Viewfinder */}
            {receiptStep === 2 && (
              <CameraCapture 
                onCapture={(base64) => {
                  setReceiptImage(base64);
                  setReceiptStep(3);
                }}
                onCancel={() => {
                  setReceiptStep(1);
                  setWaiverAgreed(false);
                }}
              />
            )}

            {/* Step 3: Receipt Attached Preview */}
            {receiptStep === 3 && receiptImage && (
              <div className="space-y-4">
                <div className="border-b border-[#e7dff0] pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-[#c9ff4d] bg-[#21152d] px-2 py-0.5 rounded">Attached</span>
                    <h4 className="text-base font-black mt-1">Receipt Bill Captured</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptStep(2)}
                    className="text-xs font-bold text-[#7441b5] bg-[#f4eff9] hover:bg-[#e7dff0] px-3 py-1 rounded-lg transition"
                  >
                    Retake / Change
                  </button>
                </div>
                <div 
                  onClick={() => triggerPreview(receiptImage)}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/5 border border-[#e7dff0] flex items-center justify-center cursor-zoom-in group"
                >
                  <img 
                    src={receiptImage} 
                    alt="Receipt preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider transition">
                    🔍 Compare
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-medium text-green-800 flex items-center gap-2">
                  <span>✅</span>
                  <div>
                    <p className="font-bold">Waiver Signed & Bill Attached</p>
                    <p className="opacity-90 text-[10px]">Your review will display a verified badge once approved by our moderation team.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        <button 
          disabled={isSubmitting || (verifyVisit && receiptStep !== 3)} 
          className="mt-6 w-full rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] disabled:opacity-50 px-5 py-3.5 font-black text-white transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Publishing...
            </>
          ) : (
            "Publish review"
          )}
        </button>
        {previewingImages && previewingImages.length > 0 && (
          <SideBySidePreview
            images={previewingImages}
            initialSelectedIndex={previewingInitialIndex}
            onClose={() => setPreviewingImages(null)}
          />
        )}
      </form>
    </div>}
  </div>;
}

