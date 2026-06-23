import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CafeForm } from "@/components/cafe-form";

interface EditPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export default async function EditCafePage({ params }: EditPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    redirect("/auth/signin");
  }

  // Fetch the cafe details
  const cafe = await prisma.cafePage.findUnique({
    where: { slug: params.slug },
    include: {
      vibeTags: { include: { tag: true } },
      foodTypeTags: { include: { tag: true } },
      photos: true
    }
  });

  if (!cafe) {
    notFound();
  }

  // Ensure owner is editing, or user is an ADMIN
  if (cafe.ownerId !== user.id && user.role !== "ADMIN") {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fbf9ff] px-5 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl card-shadow border border-[#e7dff0]">
          <span className="text-4xl">🚫</span>
          <h1 className="text-3xl font-black mt-4">Access Denied</h1>
          <p className="text-sm text-[#756a7d] mt-2">
            You do not have permission to edit this listing.
          </p>
          <a href="/dashboard" className="mt-6 inline-block bg-[#7441b5] text-white rounded-xl px-5 py-2.5 font-bold text-sm">
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  // Map database format to initialData structure for the form
  const initialData = {
    id: cafe.id,
    slug: cafe.slug,
    name: cafe.name,
    address: cafe.address,
    city: cafe.city,
    neighborhood: cafe.neighborhood || "",
    description: cafe.description || "",
    openingHours: cafe.openingHours,
    gradient: cafe.gradient,
    menuDesc: cafe.menuDesc || "",
    menuPhotoUrl: cafe.menuPhotoUrl || "",
    instagramUrl: cafe.instagramUrl || "",
    businessProofUrl: cafe.businessProofUrl || "",
    vibeTags: cafe.vibeTags.map(vt => vt.tag.name),
    foodTags: cafe.foodTypeTags.map(ft => ft.tag.name),
    galleryPhotos: cafe.photos.filter(p => !p.isPrimary).map(p => p.cloudinaryUrl)
  };

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">
          Manage My Business
        </p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl tracking-tight">
          Edit Cafe Details
        </h1>
        <p className="mt-2 text-sm text-[#756a7d] mb-10">
          Modify details, tags, hours, or menus for {cafe.name}.
        </p>

        <CafeForm initialData={initialData} />
      </div>
    </main>
  );
}
