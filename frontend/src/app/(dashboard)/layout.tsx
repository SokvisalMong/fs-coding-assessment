import { ReactNode } from "react";
import { UserProfile } from "@/components/user-profile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4">
      <UserProfile />
      {children}
    </div>
  );
}