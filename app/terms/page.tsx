import Link from "next/link";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600">Last updated: August 5, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white border rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Bike Parts Tracker ("the Service"), you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bike Parts Tracker is a web application that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Track bicycle components and maintenance schedules</li>
              <li>Record service history and part installations</li>
              <li>Monitor component performance and lifecycle</li>
              <li>Manage multiple bicycles and their associated parts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use our Service, you must create an account by signing in with
              a supported provider (Google or Strava). You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data and Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how
              we collect, use, and protect your information when you use our
              Service. By using our Service, you agree to the collection and use
              of information in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Upload malicious code or attempt to compromise the Service
              </li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Share false or misleading information</li>
              <li>Attempt to reverse engineer or compromise our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Third-Party Integrations
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service integrates with third-party services including Google
              and Strava for authentication. Your use of these services is
              subject to their respective terms of service and privacy policies.
              We are not responsible for the practices of these third-party
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Service Availability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high service availability, but we do not
              guarantee that the Service will be available 100% of the time. We
              reserve the right to modify, suspend, or discontinue the Service
              at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is provided "as is" without any warranties. We shall
              not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of any significant changes by updating the "Last
              updated" date at the top of this page. Your continued use of the
              Service after such modifications constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:support@bikepartstracker.com"
                className="text-blue-600 hover:text-blue-500"
              >
                support@bikepartstracker.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Link href="/privacy">
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Privacy Policy</span>
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
