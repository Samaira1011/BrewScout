import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminModerationHub } from "@/components/admin-moderation-hub";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fbf9ff] px-5 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl card-shadow border border-[#e7dff0]">
          <span className="text-4xl">🚫</span>
          <h1 className="text-3xl font-black mt-4">Access Denied</h1>
          <p className="text-sm text-[#756a7d] mt-2">
            This area is restricted to system administrators. Please sign in with an administrator account (e.g. admin@example.com).
          </p>
          <a href="/auth/signin" className="mt-6 inline-block bg-[#7441b5] text-white rounded-xl px-5 py-2.5 font-bold text-sm">
            Sign in as Admin
          </a>
        </div>
      </main>
    );
  }

  // Fetch Stats
  const stats = {
    totalCafes: await prisma.cafePage.count(),
    totalUsers: await prisma.user.count(),
    totalReviews: await prisma.review.count(),
  };

  // 1. Fetch pending reviews requiring admin approval
  const pendingReviews = await prisma.review.findMany({
    where: {
      isApproved: false
    },
    include: {
      author: true,
      cafe: true,
      receipt: true
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Fetch pending claims
  const pendingClaims = await prisma.claimRequest.findMany({
    where: { status: "PENDING" },
    include: {
      requester: true,
      cafe: true
    },
    orderBy: { createdAt: "desc" }
  });

  // 2b. Fetch pending unverified cafe listings
  const pendingCafes = await prisma.cafePage.findMany({
    where: {
      isVerified: false,
      businessProofUrl: { not: null }
    },
    include: {
      owner: true
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Fetch pending reports
  const pendingReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: true,
      review: {
        include: {
          author: true,
          cafe: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Map to matching client components structures
  const mappedReceipts = pendingReviews.map(r => ({
    id: r.id,
    authorEmail: r.author.email,
    cafeName: r.cafe.name,
    rating: r.rating,
    body: r.body || "",
    receiptUrl: r.receipt?.cloudinaryPublicId || "",
    uploadedAt: r.createdAt.toISOString()
  }));

  const mappedClaims = pendingClaims.map(c => ({
    id: c.id,
    requesterEmail: c.requester.email,
    cafeName: c.cafe.name,
    cafeAddress: c.cafe.address,
    createdAt: c.createdAt.toISOString()
  }));

  const mappedCafes = pendingCafes.map(c => ({
    id: c.id,
    name: c.name,
    address: c.address,
    ownerEmail: c.owner?.email || "Unknown Owner",
    businessProofUrl: c.businessProofUrl || "",
    createdAt: c.createdAt.toISOString()
  }));

  const mappedReports = pendingReports.map(rp => ({
    id: rp.id,
    reason: rp.reason,
    reporterEmail: rp.reporter.email,
    reviewId: rp.reviewId,
    reviewAuthorEmail: rp.review.author.email,
    reviewBody: rp.review.body || "",
    cafeName: rp.review.cafe.name,
    createdAt: rp.createdAt.toISOString()
  }));

  return (
    <main className="min-h-screen px-5 py-12 md:px-8 bg-[#fbf9ff] text-[#21152d]">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#ff6679]">Control Panel</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl">Moderation Hub</h1>
        <p className="mt-2 text-sm text-[#756a7d]">Verify user receipts, review reported listings, and manage cafe page claims.</p>
        
        <div className="mt-10">
          <AdminModerationHub 
            stats={stats}
            initialReceipts={mappedReceipts}
            initialClaims={mappedClaims}
            initialReports={mappedReports}
            initialCafes={mappedCafes}
          />
        </div>
      </div>
    </main>
  );
}
