import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { fetchUserProfile, fetchAvailableUnits } from "@/utils/requestsServer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const [userProfile, availableUnits] = await Promise.all([
    fetchUserProfile(),
    fetchAvailableUnits(),
  ]);

  // Debug logging
  console.log("Session data:", {
    userId: (session as any).userId,
    userName: session.user?.name,
    userEmail: session.user?.email,
  });
  console.log("Fetched user profile:", userProfile);
  console.log("Fetched available units:", availableUnits);

  // Fallback to session data if profile fetch fails or returns empty data
  const profileData = userProfile?.id
    ? userProfile
    : {
        id: (session as any).userId || session.user?.id || "",
        name: session.user?.name || "",
        email: session.user?.email || "",
        image: session.user?.image || "",
        currency_unit: null,
        weight_unit: null,
        distance_unit: null,
        strava_user: null,
      };

  return (
    <section className="bg-slate-50 pt-6 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <ProfileForm
            userProfile={profileData}
            availableUnits={availableUnits}
          />
        </div>
      </div>
    </section>
  );
}
