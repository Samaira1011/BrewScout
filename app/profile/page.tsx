import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProfileReviewsList } from "@/components/profile-reviews-list";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ProfileEditForm } from "@/components/profile-edit-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/signin");
  }

  // Fetch user details, reviews, receipts and cafes
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      reviews: {
        include: {
          cafe: true,
          receipt: true
        },
        orderBy: { createdAt: "desc" }
      },
      ownedCafes: true
    }
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const verifiedReviewsCount = user.reviews.filter(r => r.isVerified).length;
  const pendingReviewsCount = user.reviews.filter(r => !r.isVerified && r.receipt).length;

  return (
    <main className="min-h-screen px-5 py-12 md:px-8 bg-[#fbf9ff] text-[#21152d]">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">Account Hub</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl">My Profile</h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
          
          {/* Profile Card */}
          <aside className="h-fit rounded-[2.5rem] bg-[#21152d] text-white p-8 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-[#7441b5] to-[#ff6679] opacity-20 blur-3xl pointer-events-none" />
            <div className="flex flex-col items-center text-center">
              {user.photoUrl ? (
                <div className="h-20 w-20 rounded-full overflow-hidden shadow-lg border-4 border-white/10">
                  <img src={user.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#ff6679] text-3xl font-black text-white uppercase shadow-lg border-4 border-white/10">
                  {(user.name || user.email).charAt(0)}
                </div>
              )}
              
              <h2 className="mt-5 text-xl font-bold truncate w-full">{user.name || user.email.split("@")[0]}</h2>
              <p className="text-xs text-white/50 mt-1">{user.email}</p>
              {user.phoneNumber && <p className="text-xs text-white/40 mt-1">{user.phoneNumber}</p>}
              
              <span className="mt-4 inline-block rounded-full bg-[#c9ff4d] text-[#21152d] px-4 py-1 text-xs font-black uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Member since</span>
                <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Total reviews</span>
                <span className="font-bold">{user.reviews.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Verified visits</span>
                <span className="font-bold text-[#c9ff4d]">{verifiedReviewsCount}</span>
              </div>
              {pendingReviewsCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/50">Pending verification</span>
                  <span className="font-bold text-amber-300">{pendingReviewsCount}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <a href="/api/auth/signout" className="block text-center w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold py-3 transition text-sm">
                Sign out of account
              </a>
            </div>
          </aside>

          {/* Main Content Areas */}
          <section className="space-y-8">
            
            {/* Interactive Edit Profile Settings Form */}
            <ProfileEditForm user={{
              id: user.id,
              email: user.email,
              role: user.role,
              name: user.name,
              phoneNumber: user.phoneNumber,
              photoUrl: user.photoUrl,
              bio: user.bio,
              instagram: user.instagram,
              twitter: user.twitter,
              city: user.city,
              favoriteCoffee: user.favoriteCoffee,
              gender: user.gender,
              dob: user.dob ? user.dob.toISOString() : null
            }} />

            {/* Business section for owners */}
            {(user.role === "OWNER" || user.role === "ADMIN" || user.ownedCafes.length > 0) && (
              <div className="rounded-[2rem] bg-white p-7 card-shadow">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-black">Your Cafe Businesses</h3>
                    <p className="text-sm text-[#756a7d] mt-1">Manage cafe listings and view business statistics.</p>
                  </div>
                  <Link href="/dashboard" className="rounded-xl bg-[#7441b5] hover:bg-[#5f32c4] px-5 py-2.5 text-sm font-bold text-white transition">
                    Open Dashboard
                  </Link>
                </div>
                {user.ownedCafes.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {user.ownedCafes.map(cafe => (
                      <Link 
                        key={cafe.id} 
                        href={`/cafes/${cafe.slug}`}
                        className={`rounded-2xl p-5 bg-gradient-to-br ${cafe.gradient} text-white flex flex-col justify-between h-32 hover:-translate-y-0.5 transition`}
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                            {cafe.neighborhood}
                          </span>
                          <h4 className="text-xl font-black mt-2">{cafe.name}</h4>
                        </div>
                        <span className="text-xs font-bold opacity-85 text-right">View public listing →</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 p-4 border border-[#e7dff0] rounded-xl text-center text-sm text-[#756a7d]">
                    You haven't claimed any cafe listings yet.
                  </div>
                )}
              </div>
            )}

            {/* Reviews list */}
            <div className="rounded-[2rem] bg-white p-7 card-shadow">
              <h3 className="text-2xl font-black">My Reviews ({user.reviews.length})</h3>
              <p className="text-sm text-[#756a7d] mt-1 mb-6">Review histories and verification statuses.</p>
              
              <ProfileReviewsList initialReviews={user.reviews.map(r => ({
                id: r.id,
                cafeName: r.cafe.name,
                cafeSlug: r.cafe.slug,
                rating: r.rating,
                body: r.body || "",
                isVerified: r.isVerified,
                hasReceipt: !!r.receipt,
                receiptUrl: r.receipt?.cloudinaryPublicId || null,
                createdAt: r.createdAt.toISOString()
              }))} />
            </div>

          </section>

        </div>
      </div>
    </main>
  );
}
