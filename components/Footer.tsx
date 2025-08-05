import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="order-2 sm:order-1">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Bike Parts Tracker. All rights reserved.
            </p>
          </div>
          <div className="order-1 sm:order-2 flex items-center space-x-4">
            <Link
              href="/terms"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
