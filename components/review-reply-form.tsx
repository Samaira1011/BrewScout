"use client";

import { useState, FormEvent } from "react";

interface ReviewReplyFormProps {
  reviewId: string;
  initialReply: string;
}

export function ReviewReplyForm({ reviewId, initialReply }: ReviewReplyFormProps) {
  const [body, setBody] = useState(initialReply);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit reply");

      setMessage("✅ Reply submitted successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-[#f4eff9] pt-4 space-y-3">
      <label className="block text-xs font-bold text-[#756a7d]">
        Write Public Owner Reply
        <textarea
          required
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1.5 w-full resize-none rounded-xl border border-[#e7dff0] px-3.5 py-2.5 text-sm outline-[#7441b5] text-[#21152d]"
          placeholder="Thank the customer, address feedback, or clarify information..."
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          disabled={loading}
          type="submit"
          className="bg-[#7441b5] hover:bg-[#5f32c4] disabled:opacity-50 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition"
        >
          {loading ? "Submitting..." : initialReply ? "Update Reply" : "Post Reply"}
        </button>
        {message && (
          <span className="text-xs font-bold text-[#7441b5]">
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
