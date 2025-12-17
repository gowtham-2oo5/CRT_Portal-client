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
    console.log("[DashboardLayout] useEffect triggered, user:", user);
    console.log("[DashboardLayout] user?.isFirstLogin:", user?.isFirstLogin);
    
    // Check if user needs to reset password on first login
    if (user?.isFirstLogin) {
      console.log("[DashboardLayout] First login detected! Setting up password modal...");
      // Small delay to let dashboard render first
      setTimeout(() => {
        console.log("[DashboardLayout] Showing password reset modal now...");
        setShowPasswordModal(true);
      }, 500);
    } else if (user) {
      console.log("[DashboardLayout] User exists but not first login");
    } else {
      console.log("[DashboardLayout] No user object available");
    }
  }, [user]);

  const handlePasswordResetSuccess = () => {
    setShowPasswordModal(false);
    toast.success(
      `Welcome to your ${
        user?.role === "FACULTY" ? "faculty " : ""
      }dashboard! Your account is now secure.`
    );
  };

  // Render layout based on user role
  const renderLayout = () => {
    // console.log("User object in DashboardContent:", user);
    console.log("User role:", user?.role);
    if (user?.role === "FACULTY") {
      return <FacultyLayout>{children}</FacultyLayout>;
    }

    // Default admin layout
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex h-[calc(100vh-73px)]">
          <DashboardNav />
          <ScrollArea className="flex-1">
            <main className="p-6">{children}</main>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderLayout()}

      {/* First Login Password Reset Modal - Applied to ALL roles */}
      {user && (
        <PasswordResetModal
          open={showPasswordModal}
          onOpenChange={setShowPasswordModal}
          user={user}
          onSuccess={handlePasswordResetSuccess}
        />
      )}
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  );
}
