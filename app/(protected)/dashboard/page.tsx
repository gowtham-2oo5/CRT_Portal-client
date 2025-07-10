"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-guard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Immediate redirect based on user role
      if (user.role === 'FACULTY') {
        router.replace('/dashboard/faculty');
      } else if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin');
      }
    }
  }, [user, isLoading, router]);

  // Show minimal loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : "Redirecting to your dashboard..."}
        </p>
      </div>
    </div>
  );
}
