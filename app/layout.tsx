import "./globals.css";
import type { Metadata } from "next";
// import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { MainNav } from "@/components/main-nav";
import UserButton from "@/components/user-button";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Bike Parts Tracker",
  description:
    "This is an example site to demonstrate how to use NextAuth.js for authentication",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <SessionProvider>
          {/* <Header /> */}

          <nav className="sticky flex justify-center border-b bg-slate-50 shadow">
            <div className="flex items-center justify-between mx-auto w-full h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
              <MainNav />
              <UserButton />
            </div>
          </nav>

          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                style: {
                  background: "#4ade80",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
