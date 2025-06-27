"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { OtpDialog } from "@/components/auth/otp-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { GraduationCap } from "lucide-react";
import type { User } from "@/lib/auth/types";

export default function LoginPage() {
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");

  const handleLoginSuccess = (user: User, loginCredential: string) => {
    setCurrentUser(user);
    setUsernameOrEmail(loginCredential);
    setShowOtpDialog(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="auth-pattern absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <GraduationCap className="h-20 w-20 mb-6" />
            <h1 className="text-4xl font-bold mb-4">CRT Portal</h1>
            <h2 className="text-2xl font-light mb-6">@ KL University</h2>
            <p className="text-lg opacity-90 max-w-md text-center leading-relaxed">
              Empowering students, faculty, and administrators with seamless
              access to career development resources and placement opportunities
              at KL University.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-sm opacity-80">Students Placed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm opacity-80">Partner Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">96%</div>
              <div className="text-sm opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden flex items-center">
            <GraduationCap className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-semibold">CRT Portal @ KLU</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome Back
              </h2>
              <p className="text-muted-foreground mt-2">
                Sign in to access your CRT dashboard
              </p>
            </div>

            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>

      {/* OTP Verification Dialog */}
      {currentUser && (
        <OtpDialog
          open={showOtpDialog}
          onOpenChange={setShowOtpDialog}
          user={currentUser}
          usernameOrEmail={usernameOrEmail}
        />
      )}
    </div>
  );
}
