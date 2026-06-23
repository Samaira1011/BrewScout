"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs hidden sm:block">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Quick search spots/vibes..."
        className="w-full rounded-full bg-white/10 border border-white/10 focus:border-[#c9ff4d]/45 focus:bg-white/15 px-4 py-2 pl-9 text-xs text-white outline-none placeholder:text-white/40 transition-all duration-200"
      />
      <span className="absolute left-3.5 top-2.5 text-white/30 pointer-events-none">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
    </form>
  );
}
