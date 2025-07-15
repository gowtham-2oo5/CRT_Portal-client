"use client";

import { ApiConnectionTest } from "@/components/diagnostics/api-connection-test";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">API Connection Diagnostics</h1>
        <p className="text-muted-foreground">
          Test and debug API connectivity issues
        </p>
      </PageHeader>
      <ApiConnectionTest />
    </div>
  );
}
