"use client";

import { useAuthStore } from "@/store/auth.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const firstLetter = user.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="fixed top-4 right-4 z-50 scale-90 origin-top-right">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full bg-background border p-1 pr-2.5 hover:bg-accent transition-colors focus:outline-none">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{user.username}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal py-2">
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs font-medium leading-none">{user.username}</p>
              <p className="text-[10px] leading-none text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer py-1.5 text-xs"
          >
            <SignOutIcon className="mr-2 h-3.5 w-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
