import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Funnel, Headphones } from "phosphor-react";

export default async function TicketsPage() {
  await requireAuth();

  const tickets = await db.serviceTicket.findMany({
    include: { customer: true, assignee: true },
    orderBy: { createdAt: "desc" },
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    OPEN: "default",
    IN_PROGRESS: "warning",
    WAITING: "secondary",
    RESOLVED: "success",
    CLOSED: "secondary",
  };

  const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "warning"> = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "warning",
    CRITICAL: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tickets</h2>
          <p className="text-sm text-muted-foreground">{tickets.length} tickets</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Funnel className="mr-1.5 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Ticket</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Priority</th>
                  <th className="pb-3 font-medium text-muted-foreground">Assignee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border">
                    <td className="py-3">
                      <p className="font-medium">{ticket.number}</p>
                      <p className="text-xs text-muted-foreground">{ticket.title}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{ticket.customer.name}</td>
                    <td className="py-3">
                      <Badge variant={priorityVariant[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {ticket.assignee
                        ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[ticket.status]}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
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
