"use client";

import { signIn, signOut } from "@/lib/auth-client";
import { Button, type ButtonProps } from "./ui/button";
import { useRouter } from "next/navigation";

export function SignIn({
  provider,
  children = "Sign In",
  ...props
}: { provider?: string; children?: React.ReactNode } & ButtonProps) {
  const router = useRouter();
  
  return (
    <Button 
      onClick={async () => {
        if (provider === "google") {
          await signIn.social({ provider: "google" });
        } else {
          router.push("/auth/signin");
        }
      }} 
      {...props}
    >
      {children}
    </Button>
  );
}

export function SignOut(props: ButtonProps) {
  const router = useRouter();
  
  return (
    <Button
      variant="ghost"
      className="w-full p-0"
      onClick={async () => {
        await signOut();
        router.push("/auth/signin");
      }}
      {...props}
    >
      Sign Out
    </Button>
  );
}
