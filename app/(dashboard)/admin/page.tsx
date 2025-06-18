import { AuthGuard } from '@/components/auth/auth-guard';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default function AdminPage() {
  return (
    <AuthGuard requiredRoles={['ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, placements, and system settings.
          </p>
        </div>

        <AdminDashboard />
      </div>
    </AuthGuard>
  );
}
