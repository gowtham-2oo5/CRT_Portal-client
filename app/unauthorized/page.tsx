import Link from 'next/link';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <ShieldX className="h-24 w-24 text-destructive mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-8">
            You don&apos;t have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Need access? Contact your administrator at</p>
          <a 
            href="mailto:admin@kluniversity.in" 
            className="text-primary hover:underline"
          >
            admin@kluniversity.in
          </a>
        </div>
      </div>
    </div>
  );
}
