import HomeBikes from "@/components/HomeBikes";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { SignIn } from "@/components/auth-components";

export default async function Index() {
  const session = await auth();

  if (session) {
    return (
      <section className="bg-slate-50 flex-1 pt-6 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
          <HomeBikes />
          <Link href={`/parts`} className="block my-2">
            All your parts <ArrowRight size={16} className="inline" />
          </Link>
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 flex-1 flex items-center justify-center py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Track Your Bike Parts
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Keep track of all your bike components, maintenance schedules, and
              upgrades. Never lose track of your gear again.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🚴‍♂️</div>
              <h3 className="text-lg font-semibold mb-2">Manage Your Bikes</h3>
              <p className="text-gray-600">
                Keep detailed records of all your bicycles and their
                specifications.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold mb-2">Track Components</h3>
              <p className="text-gray-600">
                Monitor every part, from wheels to drivetrains, with detailed
                information.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">
                Maintenance History
              </h3>
              <p className="text-gray-600">
                Keep track of when parts were installed, replaced, or serviced.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <SignIn className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              Get Started - Sign In
            </SignIn>
            <p className="text-sm text-gray-500">
              Sign in with Google or Strava to start tracking your bike parts
            </p>
          </div>
        </div>
      </section>
    );
  }
}
