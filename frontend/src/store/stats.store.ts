import { create } from "zustand";
import { Stats } from "@/models/stats.model";
import { fetchStats } from "@/actions/stats";
import { toast } from "sonner";

interface StatsState {
  stats: Stats | null;
  isRefreshing: boolean;
  setStats: (stats: Stats) => void;
  resetStats: () => void;
  refreshStats: () => Promise<void>;
}

const initialState: StatsState = {
  stats: null,
  isRefreshing: false,
  setStats: () => {},
  resetStats: () => {},
  refreshStats: async () => {},
}

export const useStatsStore = create<StatsState>()((set) => ({
  ...initialState,
  setStats: (stats: Stats) => set({ stats }),
  resetStats: () => set({ stats: null }),
  refreshStats: async () => {
    try {
      set({ isRefreshing: true });
      const stats = await fetchStats();
      set({ stats });
    } catch (error) {
      toast.error("Failed to fetch stats", {
        description: (error as Error).message
      })
    } finally {
      set({ isRefreshing: false });
    }
  }
}))