import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Filter, HeadphonesIcon, AlertCircle, Clock } from "lucide-react";

export default async function TicketsPage() {
  await requireAuth();

  const tickets = await db.serviceTicket.findMany({
    include: {
      customer: true,
      assignee: true,
      creator: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const statusColors: Record<string, string> = {
    OPEN: "default",
    IN_PROGRESS: "warning",
    WAITING: "secondary",
    RESOLVED: "success",
    CLOSED: "outline",
  };

  const priorityColors: Record<string, string> = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "warning",
    CRITICAL: "destructive",
  };

  const categoryLabels: Record<string, string> = {
    INSTALLATION: "Installation",
    REPAIR: "Repair",
    MAINTENANCE: "Maintenance",
    COMPLAINT: "Complaint",
    INQUIRY: "Inquiry",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Tickets</h2>
          <p className="text-gray-500">{tickets.length} total tickets</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <HeadphonesIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <HeadphonesIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Ticket</th>
                  <th className="pb-3 font-medium text-gray-500">Customer</th>
                  <th className="pb-3 font-medium text-gray-500">Category</th>
                  <th className="pb-3 font-medium text-gray-500">Priority</th>
                  <th className="pb-3 font-medium text-gray-500">Assignee</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Created</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <p className="font-medium">{ticket.number}</p>
                      <p className="text-xs text-gray-500">{ticket.title}</p>
                    </td>
                    <td className="py-4 text-gray-600">{ticket.customer.name}</td>
                    <td className="py-4 text-gray-600">
                      {categoryLabels[ticket.category]}
                    </td>
                    <td className="py-4">
                      <Badge variant={priorityColors[ticket.priority] as any}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-600">
                      {ticket.assignee
                        ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="py-4">
                      <Badge variant={statusColors[ticket.status] as any}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-600">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
