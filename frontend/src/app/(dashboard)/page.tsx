"use client";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        {user && (
          <p className="text-muted-foreground">
            Welcome, {user.username} ({user.email || "No email"})
          </p>
        )}
      </div>
      
      <div>
        <Button 
          variant="destructive" 
          onClick={handleLogout}
        >
          Logout (Temporary)
        </Button>
      </div>
    </div>
  );
}

