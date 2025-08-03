import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeBikes from "@/components/HomeBikes";

export default async function BikesPage() {
  // Check authentication
  const session = await auth();
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <section className="bg-slate-50 flex-1 pt-6 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <h1 className="text-4xl font-bold mb-6">Your Bikes</h1>
        <HomeBikes />
      </div>
    </section>
  );
}
