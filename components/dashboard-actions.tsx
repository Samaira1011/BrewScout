"use client";

import Link from "next/link";

interface ActionsProps {
  slug: string;
}

export function DashboardActions({ slug }: ActionsProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Link 
        href={`/dashboard/edit-cafe/${slug}`}
        className="rounded-2xl p-6 text-left font-black bg-[#c9ff4d] transition hover:scale-[1.01] flex flex-col justify-between"
      >
        <span>Edit Cafe Profile & Menu</span>
        <span className="mt-10 text-xs opacity-60">Update info, vibes, opening hours, or menus →</span>
      </Link>
      
      <Link 
        href={`/dashboard/add-event/${slug}`}
        className="rounded-2xl p-6 text-left font-black bg-[#f4eff9] transition hover:scale-[1.01] flex flex-col justify-between"
      >
        <span>Create an Event</span>
        <span className="mt-10 text-xs opacity-60">Promote open mics, trivia, or tastings →</span>
      </Link>
 
      <Link 
        href={`/dashboard/add-deal/${slug}`}
        className="rounded-2xl p-6 text-left font-black bg-[#f4eff9] transition hover:scale-[1.01] flex flex-col justify-between"
      >
        <span>Launch a Flash Deal</span>
        <span className="mt-10 text-xs opacity-60">Drive foot traffic during slow hours →</span>
      </Link>
 
      <Link 
        href="/dashboard/checkout"
        className="rounded-2xl p-6 text-left font-black bg-[#f4eff9] transition hover:scale-[1.01] flex flex-col justify-between"
      >
        <span>Voucher Checkout Portal</span>
        <span className="mt-10 text-xs opacity-60">Validate customer claim codes and QR tickets →</span>
      </Link>
    </div>
  );
}
 
export function DashboardReplyButton({ slug }: { slug: string }) {
  return (
    <Link 
      href={`/dashboard/reviews/${slug}`}
      className="mt-8 block w-full text-center rounded-xl bg-white px-5 py-3.5 font-bold text-[#21152d] transition hover:bg-[#c9ff4d]"
    >
      Reply Publicly
    </Link>
  );
}
