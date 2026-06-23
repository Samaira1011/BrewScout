import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { HeaderSearchBar } from "@/components/header-search-bar";

export const metadata = {
  title: "VibeCheck",
  description: "Find places that match your vibe, backed by honest reviews.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return <html lang="en"><body>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#171020]/95 text-white backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c9ff4d] text-[#171020]">V</span>
          VibeCheck<span className="text-[#ff6679]">.</span>
        </Link>

        {/* Center Search Input */}
        <HeaderSearchBar />

        {/* Action Links */}
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/search" className="text-white/75 transition hover:text-white">Discover</Link>
          <Link href="/events-and-deals" className="text-white/75 transition hover:text-white">Events & Deals</Link>
          <Link href="/rewards" className="text-white/75 transition hover:text-[#c9ff4d]">Rewards</Link>
          
          {user && (
            <Link href="/profile/vouchers" className="text-white/75 transition hover:text-white">My Vouchers</Link>
          )}

          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-white/75 transition hover:text-[#c9ff4d]">Admin Panel</Link>
          )}
          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <Link href="/dashboard" className="text-white/75 transition hover:text-white">Dashboard</Link>
          )}

          {user ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              {/* VibePoints Badge */}
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c9ff4d] bg-[#c9ff4d]/10 border border-[#c9ff4d]/25 px-2.5 py-1 rounded-full">
                {user.points} PTS • {user.level}
              </span>

              {/* Profile Shortcut */}
              <Link href="/profile" className="text-white/75 transition hover:text-[#c9ff4d] flex items-center gap-2 shrink-0">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff6679] text-xs font-black text-white uppercase">
                  {user.email.charAt(0)}
                </span>
                Profile
              </Link>
              
              <Link href="/search" className="rounded-full bg-[#ff6679] hover:bg-[#eb4e64] px-4 py-2 text-xs font-black text-white transition text-center shrink-0">
                Write Review
              </Link>
              
              <a href="/api/auth/signout" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white transition hover:bg-white/10 shrink-0">Sign out</a>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <Link href="/auth/signin" className="text-white/75 transition hover:text-white">Sign in</Link>
              <Link href="/auth/register" className="rounded-full bg-white px-5 py-2.5 text-[#261336] transition hover:bg-[#c9ff4d]">Join VibeCheck</Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation fallback */}
        {user ? (
          <Link href="/profile" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#261336] md:hidden">Profile</Link>
        ) : (
          <Link href="/search" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#261336] md:hidden">Explore</Link>
        )}
      </nav>
    </header>
    {children}
  </body></html>;
}

