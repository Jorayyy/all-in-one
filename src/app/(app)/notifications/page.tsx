import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Bell, Check, Trash2 } from "lucide-react";

export default async function NotificationsPage() {
  await requireAuth();

  const notifications = [
    {
      id: "1",
      title: "Leave Request Pending",
      message: "Juan Dela Cruz has requested a vacation leave for Aug 30-31",
      time: "2 hours ago",
      read: false,
      type: "warning",
    },
    {
      id: "2",
      title: "Low Stock Alert",
      message: "Cat6 Cable (100m) is running low on stock",
      time: "5 hours ago",
      read: false,
      type: "destructive",
    },
    {
      id: "3",
      title: "Project Deadline Approaching",
      message: "CCTV Installation - Downtown Mall is due tomorrow",
      time: "1 day ago",
      read: true,
      type: "default",
    },
    {
      id: "4",
      title: "New Ticket Assigned",
      message: "Ticket #TK0012 has been assigned to you",
      time: "2 days ago",
      read: true,
      type: "default",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500">Stay updated with system activities</p>
        </div>
        <Button variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                    notification.type === "warning"
                      ? "bg-yellow-100 text-yellow-600"
                      : notification.type === "destructive"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
