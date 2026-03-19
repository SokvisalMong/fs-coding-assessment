"use client";

import { useStatsStore } from "@/store/stats.store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

export function UserStats() {
  const { stats, refreshStats, isRefreshing } = useStatsStore();

  return (
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
          <ArrowsClockwiseIcon className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
      
      <div className="space-y-1.5 pb-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-medium">Completed</span>
          <span className="font-medium">{stats?.completed || 0} / {stats?.total || 0}</span>
        </div>
        <Progress
          value={stats?.total ? ((stats?.completed || 0) / stats.total) * 100 : 0}
          className="h-2 bg-emerald-800/20 [&>div]:bg-emerald-500"
        />
      </div>
      
      <div className="flex justify-between items-center text-[10px] py-0.5">
        <span className="font-medium text-muted-foreground">In Progress</span>
        <span className="font-medium">{stats?.pending || 0}</span>
      </div>

      <div className="flex justify-between items-center text-[10px] py-0.5">
        <span className="font-medium text-muted-foreground">Not Started</span>
        <span className="font-medium">{(stats?.total || 0) - (stats?.completed || 0) - (stats?.pending || 0)}</span>
      </div>

      <div className="h-px bg-border my-0.5 opacity-50" />

      <div className="space-y-1.5 mt-1">
        <span className="text-[10px] font-medium text-muted-foreground block mb-2">By Priority</span>
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-medium text-rose-500/90 dark:text-rose-400">High</span>
          <span className="font-medium">{stats?.by_priority?.HIGH || 0}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-medium text-amber-600/90 dark:text-amber-400">Medium</span>
          <span className="font-medium">{stats?.by_priority?.MEDIUM || 0}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">Low</span>
          <span className="font-medium">{stats?.by_priority?.LOW || 0}</span>
        </div>
      </div>
    </div>
  );
}
