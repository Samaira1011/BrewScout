import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InteractiveVibeHero } from "@/components/interactive-vibe-hero";

const vibes = [
  { name: "Deep focus", icon: "01", color: "bg-[#c9ff4d]" },
  { name: "Date-worthy", icon: "02", color: "bg-[#ff8a9a]" },
  { name: "Main character", icon: "03", color: "bg-[#b993ff]" },
  { name: "Late-night", icon: "04", color: "bg-[#ffd66b]" },
];

const glowClasses: Record<string, string> = {
  "Deep focus": "card-glow text-[#21152d]",
  "Date-worthy": "card-glow-pink text-white",
  "Main character": "card-glow-purple text-white",
  "Late-night": "card-glow-yellow text-[#21152d]",
};

export default async function Home() {
  const verifiedCafes = await prisma.cafePage.findMany({
    where: { isVerified: true },
    include: {
      photos: true,
      vibeTags: {
        include: {
          tag: true
        }
      }
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  const spots = verifiedCafes.map(cafe => ({
    name: cafe.name,
    slug: cafe.slug,
    area: cafe.neighborhood || cafe.city,
    score: cafe.reviewCount > 0 ? (cafe.ratingSum / cafe.reviewCount).toFixed(1) : "4.8",
    vibe: cafe.vibeTags[0]?.tag.name || "Cozy Vibe",
    coverPhotoUrl: cafe.photos.find(p => p.isPrimary)?.cloudinaryUrl || null,
    gradient: cafe.gradient || "from-[#ff9a8b] to-[#ff6a88]"
  }));

  return <main>
    <section className="hero-glow grain overflow-hidden px-5 pb-20 pt-16 text-white md:px-8 md:pb-28 md:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#c9ff4d]" /> Honest reviews. Zero pay-to-hide.
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl md:text-8xl">
            Find a place that <span className="text-[#c9ff4d]">gets you.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">Search by mood, moment, or neighborhood. VibeCheck helps you discover cafes through real experiences and receipt-verified reviews.</p>
          <form action="/search" className="mt-10 flex max-w-2xl flex-col gap-2 rounded-[1.4rem] bg-white p-2 card-shadow sm:flex-row">
            <input name="q" aria-label="Location or cafe" placeholder="Search a vibe, area, or cafe..." className="min-w-0 flex-1 rounded-2xl px-5 py-4 text-[#21152d] outline-none placeholder:text-[#8e8298]" />
            <button className="rounded-2xl bg-[#ff6679] px-7 py-4 font-extrabold text-white transition hover:bg-[#eb4e64]">Check the vibe</button>
          </form>
          <p className="mt-4 text-sm text-white/50">Popular: work-friendly, rooftop, brunch, open late</p>
        </div>
        <div className="relative hidden lg:block w-full">
          <InteractiveVibeHero />
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">Pick your mood</p><h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">What&apos;s the vibe?</h2></div>
        <Link href="/search" className="font-bold text-[#7441b5]">See every vibe →</Link>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{vibes.map(vibe =>
        <Link key={vibe.name} href={`/search?vibe=${encodeURIComponent(vibe.name)}`} className={`group rounded-[1.7rem] p-6 transition border border-transparent card-shadow ${glowClasses[vibe.name] || 'card-glow'} ${vibe.color}`}>
          <span className="text-xs font-black opacity-50">{vibe.icon}</span>
          <h3 className="mt-14 text-2xl font-black tracking-tight">{vibe.name}</h3>
          <p className="mt-2 text-sm font-semibold opacity-60">Find your perfect spot →</p>
        </Link>)}</div>
    </section>

    <section className="bg-[#21152d] px-5 py-20 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#c9ff4d]">Trending now</p>
        <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Spots worth checking</h2>
        {spots.length === 0 ? (
          <p className="mt-8 text-white/50 text-sm font-semibold">No verified spots listed yet. Check back soon!</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">{spots.map(spot =>
            <Link href={`/cafes/${spot.slug}`} key={spot.name} className="overflow-hidden rounded-[1.8rem] bg-white text-[#21152d] transition hover:-translate-y-1">
              <div className={`relative h-52 bg-gradient-to-br ${spot.gradient} p-5 overflow-hidden`}>
                {spot.coverPhotoUrl && (
                  <img src={spot.coverPhotoUrl} alt={spot.name} className="absolute inset-0 h-full w-full object-cover opacity-85 animate-fade-in" />
                )}
                <span className="relative z-10 rounded-full bg-white/85 px-3 py-1.5 text-xs font-black">VERIFIED FAVORITE</span>
              </div>
              <div className="p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-black">{spot.name}</h3><p className="mt-1 text-sm text-[#756a7d]">{spot.area} · {spot.vibe}</p></div><span className="rounded-full bg-[#c9ff4d] px-3 py-2 text-sm font-black">★ {spot.score}</span></div></div>
            </Link>)}</div>
        )}
      </div>
    </section>

    <section className="px-5 py-20 text-center md:px-8">
      <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-[#ff6679] px-6 py-14 text-white card-shadow md:px-14">
        <p className="text-sm font-black uppercase tracking-[.2em] text-white/70">Your opinion matters</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Had a vibe? Share it.</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">Help others find their next favorite place with an honest, verified review.</p>
        <Link href="/auth/register" className="mt-8 inline-block rounded-full bg-[#21152d] px-7 py-4 font-extrabold">Join the community</Link>
      </div>
    </section>
  </main>;
}
