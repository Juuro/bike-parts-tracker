import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between flex items-center py-4">
        <div className="order-2">
          <a
            href="#"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Mastodon
          </a>
        </div>
        <div className="order-1">
          <p className="text-xs text-slate-400">
            © 2024 Bike Parts Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
