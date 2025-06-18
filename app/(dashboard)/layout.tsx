"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PasswordResetModal } from "@/components/auth/password-reset-modal";
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-6">{children}</main>
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
