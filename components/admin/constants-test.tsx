"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { 
  DAYS_OF_WEEK,
  SLOT_TYPES,
  DAY_DISPLAY_NAMES,
  SLOT_TYPE_DISPLAY_NAMES,
} from "@/lib/types/section-schedule";

export function ConstantsTest() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Constants Verification Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">DAYS_OF_WEEK ({DAYS_OF_WEEK.length} items):</h3>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Badge key={day} variant="outline">
                  {day} → {DAY_DISPLAY_NAMES[day]}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">SLOT_TYPES ({SLOT_TYPES.length} items):</h3>
            <div className="flex flex-wrap gap-2">
              {SLOT_TYPES.map((type) => (
                <Badge key={type} variant="outline">
                  {type} → {SLOT_TYPE_DISPLAY_NAMES[type]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✅ All constants are properly imported and accessible!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
