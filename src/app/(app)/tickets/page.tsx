import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus } from "@/components/icons";
import { TicketStatusSelect } from "@/components/tickets/ticket-status-select";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; status?: string; priority?: string; page?: string }>;

export default async function TicketsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "";
  const priority = params.priority || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = {};
  if (q) {
    (where as Record<string, unknown>).OR = [
      { title: { contains: q, mode: "insensitive" as const } },
      { number: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (status) (where as Record<string, unknown>).status = status;
  if (priority) (where as Record<string, unknown>).priority = priority;

  const [total, tickets] = await Promise.all([
    db.serviceTicket.count({ where: where as never }),
    db.serviceTicket.findMany({
      where: where as never,
      include: { customer: true, assignee: true },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

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

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (priority) sp.set("priority", priority);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tickets</h2>
          <p className="text-sm text-muted-foreground">{total} tickets</p>
        </div>
        <Link href="/tickets/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
            <Input name="q" placeholder="Search tickets..." defaultValue={q} className="h-9 w-full max-w-xs" />
            <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING">WAITING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <select name="priority" defaultValue={priority} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(q || status || priority) && <Link href="/tickets" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
          </form>

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
                {tickets.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No tickets found</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border">
                      <td className="py-3">
                        <p className="font-medium">{ticket.number}</p>
                        <p className="text-xs text-muted-foreground">{ticket.title}</p>
                      </td>
                      <td className="py-3 text-muted-foreground">{ticket.customer.name}</td>
                      <td className="py-3"><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge></td>
                      <td className="py-3 text-muted-foreground">{ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : "Unassigned"}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
                          <TicketStatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(ticket.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/tickets${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {page < totalPages ? <Link href={`/tickets${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
