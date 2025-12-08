"use client";

import { signIn, signOut } from "@/lib/auth-client";
import { Button, type ButtonProps } from "./ui/button";

export function SignIn({
  provider,
  children = "Sign In",
  ...props
}: { provider?: string; children?: React.ReactNode } & ButtonProps) {
  return (
    <Button
      onClick={() => {
        if (provider === "google") {
          signIn.social({
            provider: "google",
            callbackURL: "/",
          });
        } else {
          // For credentials login, redirect to signin page
          window.location.href = "/signin";
        }
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SignOut(props: ButtonProps) {
  return (
    <Button
      variant="ghost"
      className="w-full p-0"
      onClick={() => {
        signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        });
      }}
      {...props}
    >
      Sign Out
    </Button>
  );
}
