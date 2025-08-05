"use client";

import Link from "next/link";
import { Bike, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const SUPPORT_EMAIL = "support@bikepartstracker.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <Search className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            Looks like this bike part has gone missing! The page you're looking
            for doesn't exist or has been moved.
          </p>
        </div>

        {/* Bike-themed illustration */}
        <div className="flex justify-center space-x-2 py-4">
          <div className="bg-blue-200 p-2 rounded-full animate-bounce delay-0">
            <Bike className="w-6 h-6 text-blue-600" />
          </div>
          <div className="bg-blue-200 p-2 rounded-full animate-bounce delay-150">
            <Bike className="w-6 h-6 text-blue-600" />
          </div>
          <div className="bg-blue-200 p-2 rounded-full animate-bounce delay-300">
            <Bike className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Looking for something specific?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Check your bikes and parts</p>
            <p>• Review maintenance history</p>
            <p>• Add new components</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            If you believe this is an error, please{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-blue-600 hover:text-blue-500"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
