import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { CafeForm } from "@/components/cafe-form";

export const dynamic = "force-dynamic";

export default async function AddCafePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-screen bg-[#fbf9ff] px-5 py-12 md:px-8 text-[#21152d]">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[.2em] text-[#7441b5]">
          Manage My Business
        </p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl tracking-tight">
          List a New Cafe
        </h1>
        <p className="mt-2 text-sm text-[#756a7d] mb-10">
          Enter your place details. The listing will go live once verified by our moderation team.
        </p>

        <CafeForm />
      </div>
    </main>
  );
}
