import { ReactNode } from "react";
import { UserProfile } from "@/components/user-profile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4">
      <UserProfile />
      {children}
    </main>
  );
}