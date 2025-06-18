"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: "setup" | "finalizing" | "dashboard";
}

export function DashboardLoader({
  isVisible,
  onComplete,
  type = "dashboard",
}: DashboardLoaderProps) {
  const [progress, setProgress] = useState(0);

  const getContent = () => {
    switch (type) {
      case "setup":
        return {
          title: "Setting up your account",
          subtitle: "Preparing your secure workspace...",
        };
      case "finalizing":
        return {
          title: "Finalizing your setup",
          subtitle: "Almost ready to go...",
        };
      default:
        return {
          title: "Setting up your dashboard",
          subtitle: "This will only take a moment...",
        };
    }
  };

  const content = getContent();

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    // Smooth progress animation over 2.5 seconds
    const duration = 2500;
    const interval = 16; // ~60fps
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          // Small delay after completion before calling onComplete
          setTimeout(() => onComplete?.(), 200);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo or icon area */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {content.title}
          </h2>
          <p className="text-sm text-muted-foreground">{content.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full bg-primary transition-all duration-75 ease-out",
                "bg-gradient-to-r from-primary to-primary/80"
              )}
              style={{
                width: `${progress}%`,
                transition: "width 75ms ease-out",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {type === "setup"
                ? "Verifying account"
                : type === "finalizing"
                ? "Completing setup"
                : "Loading dashboard"}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Fallback redirect button if automatic redirect fails */}
        {progress >= 100 && (
          <div className="mt-4">
            <button
              onClick={() => {
                console.log("[Loader] Manual redirect triggered");
                window.location.href = "/dashboard";
              }}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              Click here if redirect doesn&apos;t work
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
