import { create } from "zustand";
import { User } from "@/models/user.model";
import { getClientCurrentUser } from "@/lib/auth-client";
import { logoutAction } from "@/actions/auth";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
  reset: () => void;
  handleUnauthorized: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,
  initialize: async () => {
    try {
      const user = await getClientCurrentUser();
      set({ user, isAuthenticated: !!user, isInitialized: true });
    } catch (error) {
      if ((error as Error).message === "UNAUTHORIZED") {
        get().handleUnauthorized();
      } else {
        console.error("Auth initialization failed:", error);
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    }
  },
  setUser: (user: User | null) => set({ user, isAuthenticated: !!user, isInitialized: true }),
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  logout: async () => {
    await logoutAction();
    get().reset();
  },
  reset: () => set(initialState),
  handleUnauthorized: () => {
    const wasAuthenticated = get().isAuthenticated;
    set({ ...initialState, isInitialized: true });
    
    if (wasAuthenticated) {
      toast.error("Session expired", {
        description: "Please login again to continue.",
      });
      window.location.href = "/login";
    }
  },
}));