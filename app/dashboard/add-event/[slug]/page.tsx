"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddEventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/cafes/${params.slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, eventAt, coverImage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      setMessage("✨ Event created successfully! Redirecting...");
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
          Create a New Event
        </h1>
        <p className="mt-2 text-sm text-[#756a7d] mb-8">
          Launch coffee tastings, open mics, or community gatherings at your spot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm font-bold">Event Title
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              placeholder="e.g. Sunday Coffee Cupping Session"
            />
          </label>

          <label className="block text-sm font-bold">Event Date & Time
            <input
              required
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
            />
          </label>

          <label className="block text-sm font-bold">Event Description
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
              placeholder="Tell visitors what to expect, pricing, signups..."
            />
          </label>

          <div className="space-y-2">
            <span className="block text-sm font-bold">Event Cover Image (Optional)</span>
            <label className="flex flex-col items-center justify-center border border-dashed border-[#e7dff0] rounded-xl p-6 bg-[#fbf9ff] cursor-pointer hover:bg-[#f4eff9] transition">
              <span className="text-2xl mb-1">📸</span>
              <span className="text-xs font-bold text-[#7441b5]">Upload Event Cover</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {coverImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5 border border-[#e7dff0] flex items-center justify-center mt-2">
                <img src={coverImage} alt="Cover preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#e7dff0]">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] disabled:opacity-50 px-5 py-3.5 font-black text-white transition flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create Event"}
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
