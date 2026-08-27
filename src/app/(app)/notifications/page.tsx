import { requireAuth } from "@/lib/auth";
import { Card, CardContent, Button } from "@/components/ui";
import { Bell, Check, Trash } from "@/components/icons";

export default async function NotificationsPage() {
  await requireAuth();

  const notifications = [
    {
      id: "1",
      title: "Leave Request Pending",
      message: "Juan Dela Cruz has requested a vacation leave for Aug 30-31",
      time: "2 hours ago",
      read: false,
      type: "warning" as const,
    },
    {
      id: "2",
      title: "Low Stock Alert",
      message: "Cat6 Cable (100m) is running low on stock",
      time: "5 hours ago",
      read: false,
      type: "destructive" as const,
    },
    {
      id: "3",
      title: "Project Deadline Approaching",
      message: "CCTV Installation - Downtown Mall is due tomorrow",
      time: "1 day ago",
      read: true,
      type: "default" as const,
    },
    {
      id: "4",
      title: "New Ticket Assigned",
      message: "Ticket #TK0012 has been assigned to you",
      time: "2 days ago",
      read: true,
      type: "default" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Stay updated with system activities</p>
        </div>
        <Button variant="outline" size="sm">
          <Check className="mr-1.5 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 ${
                  !notification.read ? "bg-secondary/50" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    notification.type === "warning"
                      ? "bg-warning/10 text-warning"
                      : notification.type === "destructive"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{notification.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
