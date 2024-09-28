import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { MainNav } from "@/components/main-nav";
import UserButton from "@/components/user-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bike Parts Tracker",
  description:
    "This is an example site to demonstrate how to use NextAuth.js for authentication",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`h-full ${inter.className}`}>
        <SessionProvider>
          {/* <Header /> */}

          <nav className="sticky fixed flex justify-center border-b bg-slate-50 shadow">
            <div className="flex items-center justify-between mx-auto w-full h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
              <MainNav />
              <UserButton />
            </div>
          </nav>

          <main className="">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
