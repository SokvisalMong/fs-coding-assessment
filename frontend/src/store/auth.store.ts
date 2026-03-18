import { create } from "zustand";
import { User } from "@/interfaces/auth.interface";
import { getClientCurrentUser } from "@/lib/auth-client";
import { logoutAction } from "@/actions/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,
  initialize: async () => {
    console.log("Initializing auth store...");
    const user = await getClientCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
  setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  logout: async () => {
    await logoutAction();
    get().reset();
  },
  reset: () => set(initialState),
}));



