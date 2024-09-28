"use client";
import { SignIn, SignOut } from "./auth-components";
import { useSession } from "next-auth/react";

const UserButton = () => {
  const { data: session } = useSession();
  if (!session?.user) return <SignIn />;

  return (
    <div className="flex gap-2 items-center">
      <span className="hidden text-sm sm:inline-flex">
        {session.user.email}
      </span>
      <SignOut />
    </div>
  );
};

export default UserButton;
