import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { MFASettings } from "@/components/MFASettings";
import Link from "next/link";

export default async function SecuritySettingsPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <section className="bg-slate-50 pt-6 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Security Settings
            </h1>
          </div>
          <p className="text-gray-600 mb-6">
            Manage your account security and authentication methods
          </p>
        </div>

        {/* MFA Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <MFASettings />
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Security Recommendations
              </h2>
              <p className="text-sm text-gray-600">
                Follow these best practices to keep your account secure
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Use Strong Passwords
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Create unique, strong passwords with a mix of letters,
                    numbers, and symbols for better security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Enable Multi-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra verification step to prevent unauthorized
                    access even if your password is compromised.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Save Backup Codes
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Store backup codes in a secure location to regain access if
                    you lose your primary authentication method.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Regular Security Reviews
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Periodically review your security settings and update your
                    authentication methods to ensure optimal protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
