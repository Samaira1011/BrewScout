"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddDealPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/cafes/${params.slug}/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, terms, startsAt, endsAt })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to launch flash deal");

      setMessage("⚡ Flash Deal launched successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-2xl bg-white p-8 rounded-[2rem] card-shadow border border-[#e7dff0]">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#ff6679]">
          Premium Business Hub
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Launch a Flash Deal
        </h1>
        <p className="mt-2 text-sm text-[#756a7d] mb-8">
          Drive immediate foot traffic by offering limited-time promotions (e.g. 1-for-1 espresso).
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm font-bold">Deal Title
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              placeholder="e.g. 1-for-1 Pour Overs between 2-4 PM!"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Starts At
              <input
                required
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              />
            </label>

            <label className="block text-sm font-bold">Ends At
              <input
                required
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              />
            </label>
          </div>

          <label className="block text-sm font-bold">Deal Description
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              placeholder="Describe the offer clearly to your customers..."
            />
          </label>

          <label className="block text-sm font-bold">Terms & Conditions (Optional)
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              placeholder="e.g. Valid on dine-in only, one coupon per customer"
            />
          </label>

          <div className="flex gap-3 pt-4 border-t border-[#e7dff0]">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] disabled:opacity-50 px-5 py-3.5 font-black text-white transition flex items-center justify-center gap-2"
            >
              {loading ? "Launching..." : "Launch Deal"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#e7dff0] bg-white px-5 py-3.5 font-bold text-[#564b60] hover:bg-[#fbf9ff]"
            >
              Cancel
            </Link>
          </div>

          {message && (
            <p className="rounded-xl bg-[#f4eff9] p-3 text-sm font-semibold text-[#7441b5]">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
