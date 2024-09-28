import React from "react";
// import UserButton from "./user-button";

const Header = () => {
  return (
    <footer className="bg-white mt-8 inset-x-0 bottom-0 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between flex items-center py-3">
        <div className="order-2">
          <a href="#" className="">
            <span className="text-xs text-slate-400">Mastodon</span>
          </a>
        </div>
        <div className="order-1">
          <p className="text-xs text-slate-400">
            © 2024 Bike Parts Tracker All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Header;
