"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { ClientAuth } from "@/lib/auth/client";
import { DashboardLoader } from "@/components/dashboard/dashboard-loader";
import { toast } from "sonner";
import type { User } from "@/lib/auth/types";

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  usernameOrEmail: string;
}

export function OtpDialog({
  open,
  onOpenChange,
  user,
  usernameOrEmail,
}: OtpDialogProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboardLoader, setShowDashboardLoader] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await ClientAuth.verifyOtp(usernameOrEmail, otp);

      if (result.success && result.data) {
        console.log(
          "[OTP] Verification successful, closing dialog and showing loader"
        );
        toast.success("Verification successful!");

        // Close the dialog and show dashboard loader
        onOpenChange(false);

        // Small delay before showing loader to ensure dialog closes
        setTimeout(() => {
          console.log("[OTP] Showing dashboard loader");
          setShowDashboardLoader(true);
        }, 200);
      } else {
        setError(result.message || "Invalid OTP");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardLoaderComplete = async () => {
    try {
      console.log("[OTP] Dashboard loader complete, attempting redirect");

      // Force a small delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try multiple redirect methods
      console.log("[OTP] Using router.push to /dashboard");
      router.push("/dashboard");

      // Fallback: if router.push doesn't work, use window.location
      setTimeout(() => {
        if (window.location.pathname !== "/dashboard") {
          console.log("[OTP] Router.push failed, using window.location");
          window.location.href = "/dashboard";
        }
      }, 1000);
    } catch (error) {
      console.error("[OTP] Dashboard redirect error:", error);
      toast.error("Redirect failed. Trying alternative method...");

      // Ultimate fallback
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      setCountdown(60);
      setOtp("");
      toast.success("Verification code sent!");
    } catch (error) {
      setError("Failed to resend OTP");
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;

    const maskedLocal =
      localPart[0] +
      "*".repeat(localPart.length - 2) +
      localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Verify Your Email
            </DialogTitle>
            <DialogDescription className="text-center">
              We&apos;ve sent a 6-digit verification code to
              <br />
              <span className="font-medium text-foreground">
                {maskEmail(user.email)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Enter Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest h-12"
                required
                disabled={isLoading}
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResendOtp}
              disabled={isLoading || countdown > 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Didn&apos;t receive the code? Check your spam folder or</p>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => onOpenChange(false)}
              >
                try a different login
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dashboard Loader */}
      <DashboardLoader
        isVisible={showDashboardLoader}
        onComplete={handleDashboardLoaderComplete}
        type="dashboard"
      />
    </>
  );
}
