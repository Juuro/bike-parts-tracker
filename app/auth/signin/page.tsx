"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bike, User, Activity, Wrench, Calendar, Eye, EyeOff } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  type: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        mode: isSignUp ? "signup" : "signin",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "google":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "strava":
        return <Activity className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case "google":
        return "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50";
      case "strava":
        return "bg-orange-500 text-white hover:bg-orange-600";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  const oauthProviders = providers ? Object.values(providers).filter(p => p.id !== "credentials") : [];
  const hasOAuthProviders = oauthProviders.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-blue-600 p-3 rounded-full shadow-lg">
              <Bike className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bike Parts Tracker
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {isSignUp ? "Create an account" : "Sign in"} to start tracking your bike components
          </p>
        </div>

        {/* Sign-in/up form */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 text-center">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h3>

            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Password should be at least 8 characters long
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setFormData({ email: "", password: "", name: "" });
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>

          {/* OAuth Providers */}
          {hasOAuthProviders && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    onClick={() => signIn(provider.id, { callbackUrl })}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${getProviderColor(
                      provider.id
                    )}`}
                    variant="outline"
                  >
                    {getProviderIcon(provider.id)}
                    <span>Continue with {provider.name}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Features preview */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 text-center">
            What you can track:
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                <Wrench className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  Component Maintenance
                </p>
                <p className="text-xs text-gray-600">
                  Track when parts were installed and serviced
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  Service History
                </p>
                <p className="text-xs text-gray-600">
                  Never miss maintenance schedules again
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  Performance Tracking
                </p>
                <p className="text-xs text-gray-600">
                  Monitor how your components perform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
