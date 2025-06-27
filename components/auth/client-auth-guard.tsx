'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientAuth } from '@/lib/auth/client';
import type { User } from '@/lib/auth/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: Array<'ADMIN' | 'FACULTY'>;
  fallback?: React.ReactNode;
}

export function ClientAuthGuard({ 
  children, 
  requiredRoles, 
  fallback 
}: ClientAuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await ClientAuth.getCurrentUser();
        
        if (!currentUser) {
          router.push('/');
          return;
        }

        if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
          router.push('/unauthorized');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/ogin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRoles, router]);

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
