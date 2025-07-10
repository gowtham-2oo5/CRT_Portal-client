"use client";

import type React from "react";
import { FacultyNav } from "./faculty-nav";
import { FacultyHeader } from "./faculty-header";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export function FacultyLayout({ children }: FacultyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <FacultyHeader />
      <div className="flex h-[calc(100vh-73px)]">
        <FacultyNav />
        <ScrollArea className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
