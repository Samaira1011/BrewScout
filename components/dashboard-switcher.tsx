"use client";

import { useRouter } from "next/navigation";

interface SwitcherProps {
  cafes: { name: string; slug: string }[];
  selectedSlug: string;
}

export function DashboardSwitcher({ cafes, selectedSlug }: SwitcherProps) {
  const router = useRouter();

  if (cafes.length <= 1) {
    return <h1 className="text-4xl font-black md:text-6xl tracking-tight">{cafes[0]?.name}</h1>;
  }

  return (
    <div className="relative inline-block">
      <label htmlFor="cafe-select" className="sr-only">Switch Cafe</label>
      <select 
        id="cafe-select"
        value={selectedSlug}
        onChange={(e) => {
          router.push(`/dashboard?slug=${e.target.value}`);
          router.refresh();
        }}
        className="bg-transparent text-3xl font-black md:text-5xl outline-none border-b-2 border-dashed border-[#7441b5] pr-8 cursor-pointer text-[#21152d] appearance-none"
      >
        {cafes.map(c => (
          <option key={c.slug} value={c.slug} className="text-lg font-bold text-[#21152d]">{c.name}</option>
        ))}
      </select>
    </div>
  );
}
