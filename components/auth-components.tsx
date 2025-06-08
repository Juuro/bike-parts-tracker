import { signIn, signOut } from "next-auth/react";
import { Button, type ButtonProps } from "./ui/button";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & ButtonProps) {
  return (
    <Button onClick={() => signIn(provider)} {...props}>
      Sign In
    </Button>
  );
}

export function SignOut(props: ButtonProps) {
  return (
    <Button
      variant="ghost"
      className="w-full p-0"
      onClick={() => signOut()}
      {...props}
    >
      Sign Out
    </Button>
  );
}
