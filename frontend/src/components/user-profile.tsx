"use client";

import { useAuthStore } from "@/store/auth.store";
import { useStatsStore } from "@/store/stats.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutIcon, ArrowsClockwise } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function UserProfile() {
  const { user, logout } = useAuthStore();
  const { stats, refreshStats, isRefreshing } = useStatsStore();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen, refreshStats]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const firstLetter = user.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="fixed top-4 right-4 z-50 scale-90 origin-top-right">
      <DropdownMenu onOpenChange={setIsOpen}>
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
          
          <div className="px-2 py-1.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Stats</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  refreshStats();
                }}
                disabled={isRefreshing}
              >
                <ArrowsClockwise className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">Completed</span>
                <span className="font-medium">{stats?.completed || 0}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? ((stats?.completed || 0) / stats.total) * 100 : 0}
                className="h-1.5 bg-emerald-800/40 [&>div]:bg-emerald-400"
              />
              
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">In Progress</span>
                <span className="font-medium">{stats?.pending || 0}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? ((stats?.pending || 0) / stats.total) * 100 : 0}
                className="h-1.5 bg-blue-800/40 [&>div]:bg-blue-400"
              />
              
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">Not Started</span>
                <span className="font-medium">{(stats?.total || 0) - (stats?.completed || 0) - (stats?.pending || 0)}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? (((stats?.total || 0) - (stats?.completed || 0) - (stats?.pending || 0)) / stats.total) * 100 : 0}
                className="h-1.5 bg-slate-800/40 [&>div]:bg-slate-400"
              />
              
            </div>

            <div className="h-px bg-border my-0.5 opacity-50" />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">High Priority</span>
                <span className="font-medium">{stats?.by_priority?.HIGH || 0}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? ((stats?.by_priority?.HIGH || 0) / stats.total) * 100 : 0}
                className="h-1.5 bg-rose-800/40 [&>div]:bg-rose-400"
              />
              
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">Medium Priority</span>
                <span className="font-medium">{stats?.by_priority?.MEDIUM || 0}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? ((stats?.by_priority?.MEDIUM || 0) / stats.total) * 100 : 0}
                className="h-1.5 bg-amber-800/40 [&>div]:bg-amber-400"
              />
              
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-muted-foreground">Low Priority</span>
                <span className="font-medium">{stats?.by_priority?.LOW || 0}/{stats?.total || 0}</span>
              </div>
              <Progress
                value={stats?.total ? ((stats?.by_priority?.LOW || 0) / stats.total) * 100 : 0}
                className="h-1.5 bg-zinc-800/40 [&>div]:bg-zinc-400"
              />
              
            </div>
          </div>

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
