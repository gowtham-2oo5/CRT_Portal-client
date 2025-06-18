"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/components/auth/auth-guard";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">CRT Portal</h1>
            <p className="text-xs text-muted-foreground">KL University</p>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
