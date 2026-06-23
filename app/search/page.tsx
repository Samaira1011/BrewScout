import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SortSelect } from "@/components/sort-select";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; vibe?: string; sort?: string } }) {
  const term = searchParams.q ?? "";
  const vibe = searchParams.vibe ?? "";

  let whereClause: any = { isVerified: true };

  if (term) {
    whereClause = {
      isVerified: true,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { neighborhood: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        {
          vibeTags: {
            some: {
              tag: {
                name: { contains: term, mode: "insensitive" }
              }
            }
          }
        }
      ]
    };
  } else if (vibe) {
    whereClause = {
      isVerified: true,
      vibeTags: {
        some: {
          tag: {
            name: { contains: vibe, mode: "insensitive" }
          }
        }
      }
    };
  }

  const results = await prisma.cafePage.findMany({
    where: whereClause,
    include: {
      vibeTags: {
        include: {
          tag: true
        }
      },
      foodTypeTags: {
        include: {
          tag: true
        }
      }
    }
  });

  const cafes = results.map(c => ({
    slug: c.slug,
    name: c.name,
    area: c.neighborhood,
    address: c.address,
    rating: c.reviewCount > 0 ? Number((c.ratingSum / c.reviewCount).toFixed(1)) : 0,
    reviews: c.reviewCount,
    vibe: c.vibeTags.map(vt => vt.tag.name),
    food: c.foodTypeTags.map(ft => ft.tag.name),
    gradient: c.gradient,
    description: c.description
  }));

  const sort = searchParams.sort ?? "match";
  if (sort === "rating") {
    cafes.sort((a, b) => b.rating - a.rating);
  }

  return <main className="min-h-screen">
    <section className="bg-[#21152d] px-5 py-14 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#c9ff4d]">Discover your next spot</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Check the vibe.</h1>
        <form className="mt-8 flex max-w-3xl gap-2 rounded-2xl bg-white p-2">
          <input name="q" defaultValue={term} placeholder="Cafe, neighborhood, or vibe" className="min-w-0 flex-1 rounded-xl px-4 text-[#21152d] outline-none" />
          {vibe && <input type="hidden" name="vibe" value={vibe} />}
          <button className="rounded-xl bg-[#ff6679] px-6 py-3 font-bold">Search</button>
        </form>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">{cafes.length} {cafes.length === 1 ? "place" : "places"} found</h2>
          <p className="mt-1 text-[#756a7d]">Honest reviews, sorted by fit.</p>
        </div>
        <SortSelect defaultValue={sort} term={term} vibe={vibe} />
      </div>
      {cafes.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cafes.map(cafe => (
            <Link href={`/cafes/${cafe.slug}`} key={cafe.slug} className="overflow-hidden rounded-[1.8rem] bg-white card-shadow transition hover:-translate-y-1">
              <div className={`h-48 bg-gradient-to-br ${cafe.gradient} p-5`} />
              <div className="p-6">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">{cafe.name}</h3>
                    <p className="mt-1 text-sm text-[#756a7d]">{cafe.area}</p>
                  </div>
                  <span className="h-fit rounded-full bg-[#c9ff4d] px-3 py-2 text-sm font-black">★ {cafe.rating}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {cafe.vibe.slice(0, 3).map(v => (
                    <span key={v} className="rounded-full bg-[#f4eff9] px-3 py-1.5 text-xs font-bold">{v}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] bg-white p-14 text-center card-shadow">
          <h3 className="text-2xl font-black">No matching vibes yet</h3>
          <p className="mt-2 text-[#756a7d]">Try a neighborhood or a broader mood.</p>
        </div>
      )}
    </section>
  </main>;
}
