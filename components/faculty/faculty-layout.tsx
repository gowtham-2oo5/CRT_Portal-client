"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FacultyNav } from "./faculty-nav";
import { FacultyHeader } from "./faculty-header";
import { PasswordResetModal } from "@/components/auth/password-reset-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth/auth-guard";
import { toast } from "sonner";

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export function FacultyLayout({ children }: FacultyLayoutProps) {
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
    toast.success("Welcome to your faculty dashboard! Your account is now secure.");
  };

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
