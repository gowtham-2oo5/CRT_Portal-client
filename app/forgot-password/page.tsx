"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link
            href="/"
            className="flex items-center text-primary hover:text-primary/80"
          >
            <GraduationCap className="h-8 w-8 mr-2" />
            <span className="text-xl font-semibold">CRT Portal @ KLU</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Check Your Email
              </CardTitle>
              <CardDescription>
                We&apos ve sent a temporary password to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Check your email for the temporary password</li>
                    <li>Return to the login page and sign in</li>
                    <li>You&apos;ll be prompted to create a new password</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6">
        <Link
          href="/"
          className="flex items-center text-primary hover:text-primary/80"
        >
          <GraduationCap className="h-8 w-8 mr-2" />
          <span className="text-xl font-semibold">CRT Portal @ KLU</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-muted-foreground mt-2">
              No worries, we&apos;ll send you a temporary password
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a temporary
                password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Temporary Password"
                  )}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
