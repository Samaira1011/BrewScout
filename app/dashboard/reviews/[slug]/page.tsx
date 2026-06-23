import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ReviewReplyForm } from "@/components/review-reply-form";

interface ReviewsPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export default async function CafeReviewsPage({ params }: ReviewsPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    redirect("/auth/signin");
  }

  const cafe = await prisma.cafePage.findUnique({
    where: { slug: params.slug },
    include: {
      reviews: {
        where: { isRemoved: false },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          reply: true
        }
      }
    }
  });

  if (!cafe) {
    notFound();
  }

  // Ensure owner is accessing, or user is an ADMIN
  if (cafe.ownerId !== user.id && user.role !== "ADMIN") {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fbf9ff] px-5 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl card-shadow border border-[#e7dff0]">
          <span className="text-4xl">🚫</span>
          <h1 className="text-3xl font-black mt-4">Access Denied</h1>
          <p className="text-sm text-[#756a7d] mt-2">
            You do not have permission to manage reviews for this cafe.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block bg-[#7441b5] text-white rounded-xl px-5 py-2.5 font-bold text-sm">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#e7dff0] pb-6 mb-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#ff6679]">
              Premium Business Hub
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Manage Reviews & Replies
            </h1>
            <p className="mt-2 text-sm text-[#756a7d]">
              Review public feedback and submit official replies for <strong>{cafe.name}</strong>.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#e7dff0] bg-white px-5 py-3.5 font-bold text-[#564b60] hover:bg-[#fbf9ff] shrink-0"
          >
            ← Dashboard
          </Link>
        </div>

        {cafe.reviews.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-14 text-center border border-[#e7dff0] card-shadow">
            <h3 className="text-2xl font-black">No reviews submitted yet</h3>
            <p className="mt-2 text-[#756a7d]">Once users write reviews for your cafe, they will show up here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cafe.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[2rem] bg-white border border-[#e7dff0]/80 p-7 card-shadow space-y-4"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#756a7d]">
                      By {review.author.email.split("@")[0]}
                    </span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-xs font-bold text-[#756a7d]">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isVerified && (
                      <span className="rounded-full bg-[#c9ff4d] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#21152d]">
                        Receipt Verified
                      </span>
                    )}
                    {!review.isApproved && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800 border border-amber-200">
                        ⌛ Pending Moderation
                      </span>
                    )}
                    <span className="font-black text-[#7441b5] text-sm">
                      {"★".repeat(review.rating)}
                    </span>
                  </div>
                </div>

                <p className="leading-7 text-[#564b60] italic bg-[#fbf9ff] p-4 rounded-xl border border-[#e7dff0]/40 text-sm">
                  "{review.body || "No text provided."}"
                </p>

                <ReviewReplyForm reviewId={review.id} initialReply={review.reply?.body || ""} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
