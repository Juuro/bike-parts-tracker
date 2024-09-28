import React from "react";
import { MainNav } from "./main-nav";
import UserButton from "./user-button";

const Header = () => {
  return (
    <nav className="sticky fixed flex justify-center border-b bg-slate-50 shadow">
      <div className="flex items-center justify-between mx-auto w-full h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <MainNav />
        <UserButton />
      </div>
    </nav>
  );
};

export default Header;
