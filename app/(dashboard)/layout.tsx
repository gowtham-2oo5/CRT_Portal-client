"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FacultyLayout } from "@/components/faculty/faculty-layout";
import { PasswordResetModal } from "@/components/auth/password-reset-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    // Check if user needs to reset password on first login
    if (user?.isFirstLogin) {
      // Small delay to let dashboard render first
      setTimeout(() => {
        setShowPasswordModal(true);
      }, 500);
    }
  }, [user]);

  const handlePasswordResetSuccess = () => {
    setShowPasswordModal(false);
    toast.success("Welcome to your dashboard! Your account is now secure.");
  };

  // Route based on user role
  if (user?.role === 'FACULTY') {
    return <FacultyLayout>{children}</FacultyLayout>;
  }

  // Default admin layout
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex h-[calc(100vh-73px)]">
        <DashboardNav />
        <ScrollArea className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </ScrollArea>
      </div>

      {/* First Login Password Reset Modal */}
      {user && (
        <PasswordResetModal
          open={showPasswordModal}
          onOpenChange={setShowPasswordModal}
          user={user}
          onSuccess={handlePasswordResetSuccess}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  );
}
