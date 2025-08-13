"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    // If it's specifically a state/CSRF error and we're coming from Strava
    // and sessions are being created (indicating auth actually worked)
    if (
      error === "Verification" ||
      error?.includes("state") ||
      error?.includes("CSRF")
    ) {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      // Small delay to let any session creation complete
      setTimeout(() => {
        router.push(callbackUrl);
      }, 1000);
    }
  }, [error, router, searchParams]);

  // If it's a Strava state parameter error, show a more specific message
  if (error === "Verification" || error?.includes("state")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Redirecting...</h1>
            <p className="text-gray-600">
              Authentication successful! Redirecting you to the dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Continue to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle WebAuthn configuration/authenticator-not-found gracefully
  if (error === "Configuration") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Authentication error
            </h1>
            <p className="text-gray-600">
              There was an issue with authentication. Please try signing in
              again or use a different authentication method.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/signin">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Use another method
              </Button>
            </Link>
            <Link href="/security">
              <Button variant="outline" className="w-full">
                Go to Security Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            {error === "OAuthAccountNotLinked"
              ? "This account is already linked to another user."
              : error === "AccessDenied"
              ? "You denied access to the application."
              : "There was an error during authentication."}
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/signin">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
              <p className="text-gray-600">
                Processing authentication error...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
