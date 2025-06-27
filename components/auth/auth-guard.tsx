"use client";

import { ClientAuth } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState, createContext, useContext } from "react";
import type { User } from "@/lib/auth/types";
import { DevAuthBypass } from "./dev-auth-bypass";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: Array<"ADMIN" | "FACULTY">;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';
const enableDevBypass = true; // Set this to false when you want to test real auth

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    user: User | null;
    isAuthenticated: boolean;
    showDevBypass: boolean;
  }>({
    isLoading: true,
    user: null,
    isAuthenticated: false,
    showDevBypass: false,
  });

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("[AuthGuard] Starting auth check");

        // Development bypass
        if (isDevelopment && enableDevBypass) {
          console.log("[AuthGuard] Development mode - showing bypass");
          if (isMounted) {
            setAuthState({
              isLoading: false,
              user: null,
              isAuthenticated: false,
              showDevBypass: true,
            });
          }
          return;
        }

        const isAuth = await ClientAuth.isAuthenticated();
        if (!isMounted) return;

        if (!isAuth) {
          console.log("[AuthGuard] Not authenticated");
          router.replace("/");
          return;
        }

        const currentUser = await ClientAuth.getCurrentUser();
        if (!isMounted) return;

        if (!currentUser) {
          console.log("[AuthGuard] No user data");
          router.replace("/");
          return;
        }

        // Check roles
        if (requiredRoles && requiredRoles.length > 0) {
          if (
            !requiredRoles.includes(currentUser.role as "ADMIN" | "FACULTY")
          ) {
            console.log("[AuthGuard] Insufficient permissions");
            router.replace("/unauthorized");
            return;
          }
        }

        if (isMounted) {
          setAuthState({
            isLoading: false,
            user: currentUser,
            isAuthenticated: true,
            showDevBypass: false,
          });
        }
      } catch (error) {
        console.error("[AuthGuard] Auth check failed:", error);
        if (isMounted) {
          // In development, show bypass instead of redirecting
          if (isDevelopment && enableDevBypass) {
            setAuthState({
              isLoading: false,
              user: null,
              isAuthenticated: false,
              showDevBypass: true,
            });
          } else {
            router.replace("/");
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [requiredRoles, router]);

  const handleDevUserSelect = (user: User) => {
    console.log("[AuthGuard] Dev user selected:", user);
    setAuthState({
      isLoading: false,
      user,
      isAuthenticated: true,
      showDevBypass: false,
    });
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (authState.showDevBypass) {
    return <DevAuthBypass onSelectUser={handleDevUserSelect} />;
  }

  return (
    <AuthContext.Provider
      value={{ user: authState.user, isLoading: authState.isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
