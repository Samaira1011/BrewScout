import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewExperience } from "@/components/review-experience";
import { MenuViewer } from "@/components/menu-viewer";
import { getCurrentUser } from "@/lib/auth-helpers";
import { AddVibeTag } from "@/components/add-vibe-tag";

const authorNames: Record<string, string> = {
  "maya@example.com": "Maya R.",
  "arjun@example.com": "Arjun K.",
  "nisha@example.com": "Nisha P."
};

function getAuthorName(email: string) {
  if (authorNames[email]) return authorNames[email];
  const prefix = email.split("@")[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

export default async function CafePage({ params }: { params: { slug: string } }) {
  const cafe = await prisma.cafePage.findUnique({
    where: { slug: params.slug },
    include: {
      vibeTags: { include: { tag: true } },
      foodTypeTags: { include: { tag: true } },
      photos: true,
      events: {
        where: { eventAt: { gte: new Date() } },
        orderBy: { eventAt: "asc" }
      },
      flashDeals: {
        where: { endsAt: { gte: new Date() } },
        orderBy: { endsAt: "asc" }
      },
      reviews: {
        where: { isRemoved: false, isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { 
          author: true,
          receipt: true,
          reply: true,
          photos: true
        }
      }
    }
  });

  if (!cafe) notFound();

  const user = await getCurrentUser();
  if (!cafe.isVerified) {
    const isOwner = user && user.id === cafe.ownerId;
    const isAdmin = user && user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      notFound();
    }
  }

  const rating = cafe.reviewCount > 0 ? Number((cafe.ratingSum / cafe.reviewCount).toFixed(1)) : 0;

  const mappedCafe = {
    slug: cafe.slug,
    name: cafe.name,
    area: cafe.neighborhood,
    address: cafe.address,
    rating,
    reviews: cafe.reviewCount,
    vibe: cafe.vibeTags.map(vt => vt.tag.name),
    food: cafe.foodTypeTags.map(ft => ft.tag.name),
    gradient: cafe.gradient,
    description: cafe.description
  };

  const mappedReviews = cafe.reviews.map(r => ({
    author: getAuthorName(r.author.email),
    rating: r.rating,
    verified: r.isVerified,
    body: r.body || "",
    receiptUrl: r.receipt?.cloudinaryPublicId || null,
    photos: r.photos.map(p => p.cloudinaryUrl),
    date: getRelativeTimeString(r.createdAt),
    reply: r.reply ? {
      body: r.reply.body,
      date: getRelativeTimeString(r.reply.createdAt)
    } : null
  }));

  const showNoticeBanner = !cafe.isVerified && (user && (user.id === cafe.ownerId || user.role === "ADMIN"));
  const primaryPhoto = cafe.photos.find(p => p.isPrimary);

  return <main className="min-h-screen pb-20">
    {showNoticeBanner && (
      <div className="bg-amber-500 text-white font-bold text-center px-4 py-3 text-sm flex items-center justify-center gap-2">
        <span>⚠️ This cafe listing is currently pending admin verification. It is not visible to the public.</span>
      </div>
    )}
    <section className={`relative h-72 bg-gradient-to-br ${mappedCafe.gradient} md:h-96 overflow-hidden`}>
      {primaryPhoto && (
        <>
          <img 
            src={primaryPhoto.cloudinaryUrl} 
            alt={mappedCafe.name} 
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </>
      )}
    </section>
    <section className="mx-auto -mt-14 grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="rounded-[2rem] bg-white p-7 card-shadow md:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <p className="font-bold text-[#7441b5]">{mappedCafe.area}</p>
              <h1 className="mt-1 text-4xl font-black tracking-tight md:text-6xl">{mappedCafe.name}</h1>
              <p className="mt-3 text-[#756a7d]">{mappedCafe.address}</p>
            </div>
            <div className="h-fit rounded-2xl bg-[#c9ff4d] px-5 py-4 text-center">
              <p className="text-3xl font-black">★ {mappedCafe.rating}</p>
              <p className="text-xs font-bold">{mappedCafe.reviews} reviews</p>
            </div>
          </div>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#564b60]">{mappedCafe.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {[...mappedCafe.vibe, ...mappedCafe.food].map(tag => (
              <span key={tag} className="rounded-full bg-[#f4eff9] px-4 py-2 text-sm font-bold">{tag}</span>
            ))}
            <AddVibeTag slug={mappedCafe.slug} />
          </div>

          {/* Gallery Grid */}
          {cafe.photos.filter(p => !p.isPrimary).length > 0 && (
            <div className="mt-8 border-t border-[#e7dff0]/60 pt-8 text-[#21152d]">
              <h3 className="text-xl font-black mb-4">Cafe Gallery</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {cafe.photos.filter(p => !p.isPrimary).map(photo => (
                  <div key={photo.id} className="relative aspect-video rounded-2xl overflow-hidden bg-black/5 border border-[#e7dff0]">
                    <img 
                      src={photo.cloudinaryUrl} 
                      alt="cafe gallery view" 
                      className="h-full w-full object-cover transition duration-300 hover:scale-105" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ReviewExperience slug={mappedCafe.slug} initialReviews={mappedReviews} />
      </div>
      <aside className="space-y-6">
        <div className="h-fit rounded-[2rem] bg-[#21152d] p-7 text-white card-shadow">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#c9ff4d]">Plan your visit</p>
          <h2 className="mt-3 text-2xl font-black">Open today until 10 PM</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">{mappedCafe.address}</p>
          <button className="mt-7 w-full rounded-xl bg-[#ff6679] px-5 py-3.5 font-bold">Get directions</button>
          <MenuViewer menuDesc={cafe.menuDesc} menuPhotoUrl={cafe.menuPhotoUrl} />
        </div>

        {/* Flash Deals Section */}
        {cafe.flashDeals.length > 0 && (
          <div className="h-fit rounded-[2rem] bg-gradient-to-br from-[#ff6679] to-[#21152d] p-7 text-white card-shadow border border-[#ff6679]/30">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#c9ff4d]">🔥 Active Flash Deals</p>
            <div className="mt-4 space-y-4">
              {cafe.flashDeals.map(deal => (
                <div key={deal.id} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                  <h4 className="font-black text-lg">{deal.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{deal.description}</p>
                  {deal.terms && <p className="text-[10px] text-white/50 mt-1">Terms: {deal.terms}</p>}
                  <p className="text-[10px] font-bold text-[#c9ff4d] mt-2">Ends: {new Date(deal.endsAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Section */}
        {cafe.events.length > 0 && (
          <div className="h-fit rounded-[2rem] bg-white p-7 text-[#21152d] card-shadow border border-[#e7dff0]">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#7441b5]">📅 Upcoming Events</p>
            <div className="mt-4 space-y-5">
              {cafe.events.map(event => (
                <div key={event.id} className="border-t border-[#e7dff0] pt-4 first:border-0 first:pt-0">
                  {event.coverCloudinaryUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5 mb-3 border border-[#e7dff0]">
                      <img src={event.coverCloudinaryUrl} alt={event.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-black text-base text-[#7441b5]">{event.title}</h4>
                  <p className="text-xs text-[#564b60] mt-1">{event.description}</p>
                  <p className="text-[10px] font-black text-[#ff6679] mt-2">
                    Date: {new Date(event.eventAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </section>
  </main>;
}
