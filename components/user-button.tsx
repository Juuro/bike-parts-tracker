"use client";
import { SignIn, SignOut } from "./auth-components";
import { useSession } from "next-auth/react";
import { User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

const UserButton = () => {
  const { data: session } = useSession();
  if (!session?.user) return <SignIn />;

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex gap-2 items-center hover:bg-gray-100 rounded-md px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="User menu">
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "Profile"} 
                className="w-6 h-6 rounded-full border border-gray-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={14} className="text-gray-600" />
              </div>
            )}
            <span className="hidden text-sm sm:inline-flex text-nowrap font-medium text-gray-700">
              {session.user.name}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm text-gray-600">
            <div className="font-medium">{session.user.name}</div>
            <div className="text-xs text-gray-500">{session.user.email}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full cursor-pointer flex items-center gap-2">
              <User size={14} />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <div className="w-full">
              <SignOut />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
