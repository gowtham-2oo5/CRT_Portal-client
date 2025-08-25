import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  userRole?: "ADMIN" | "FACULTY";
}

export function RecentActivity({ userRole }: RecentActivityProps) {
  // This would typically fetch data from your API
  console.log("Active user role in recent Activty", userRole);
  const activities = [
    {
      id: 1,
      type: "placement",
      title: "New placement opportunity at TCS",
      description: "Software Engineer position available",
      time: "2 hours ago",
      status: "active",
    },
    {
      id: 2,
      type: "application",
      title: "Application submitted to Infosys",
      description: "Your application has been received",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "interview",
      title: "Interview scheduled with Wipro",
      description: "Technical round on June 20th",
      time: "1 day ago",
      status: "scheduled",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
