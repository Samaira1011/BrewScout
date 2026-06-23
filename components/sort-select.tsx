"use client";

export function SortSelect({ defaultValue, term, vibe }: { defaultValue: string; term: string; vibe: string }) {
  return (
    <form method="GET" className="flex items-center gap-2">
      {term && <input type="hidden" name="q" value={term} />}
      {vibe && <input type="hidden" name="vibe" value={vibe} />}
      <select
        name="sort"
        defaultValue={defaultValue}
        onChange={(e) => e.target.form?.submit()}
        className="rounded-xl border border-[#e7dff0] bg-white px-4 py-3 font-semibold text-[#21152d] outline-none cursor-pointer"
      >
        <option value="match">Best match</option>
        <option value="rating">Highest rated</option>
      </select>
    </form>
  );
}
