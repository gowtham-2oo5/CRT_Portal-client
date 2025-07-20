"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AttendanceConfigService } from "@/lib/api/services/attendance-config";

export function AttendanceConfig() {
  const [enforceEndTime, setEnforceEndTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const config = await AttendanceConfigService.getConfig();
        setEnforceEndTime(config.enforceEndTimeRestriction);
      } catch (error) {
        toast.error("Failed to load attendance configuration.");
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleToggle = async (enabled: boolean) => {
    try {
      await AttendanceConfigService.updateEnforceEndTime(enabled);
      setEnforceEndTime(enabled);
      toast.success(`End time restriction ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      toast.error("Failed to update configuration.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Configuration</CardTitle>
        <CardDescription>Manage attendance-related settings.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading configuration...</p>
        ) : (
          <div className="flex items-center justify-between">
            <Label htmlFor="enforce-end-time">Enforce End Time Restriction</Label>
            <Switch
              id="enforce-end-time"
              checked={enforceEndTime}
              onCheckedChange={handleToggle}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
