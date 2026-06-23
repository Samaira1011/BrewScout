"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

interface AddVibeTagProps {
  slug: string;
}

export function AddVibeTag({ slug }: AddVibeTagProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanVibe = vibe.trim();
    if (!cleanVibe) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cafes/${slug}/vibes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: cleanVibe })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to suggest a vibe tag.");
          router.push("/auth/signin");
        } else {
          alert(data.error || "Failed to add vibe tag.");
        }
        return;
      }

      setVibe("");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong adding the vibe.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setVibe("");
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 animate-fadeIn">
        <input
          autoFocus
          disabled={loading}
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSubmit}
          maxLength={25}
          placeholder="e.g. pet-friendly, cozy"
          className="rounded-full border border-[#7441b5] bg-white px-3.5 py-1 text-xs font-bold text-[#21152d] outline-none shadow-sm placeholder:text-slate-400 w-36"
        />
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#7441b5] border-t-transparent" />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="rounded-full border border-dashed border-[#7441b5]/50 hover:border-[#7441b5] hover:bg-[#7441b5]/5 px-4 py-2 text-sm font-bold text-[#7441b5] transition-all duration-200"
    >
      + Suggest Vibe
    </button>
  );
}
