import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Button } from "@/components/ui";
import { Plus, MagnifyingGlass, Users, Phone, Envelope } from "phosphor-react";

export default async function CustomersPage() {
  await requireAuth();

  const customers = await db.customer.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { projects: true, invoices: true, tickets: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-sm text-muted-foreground">{customers.length} customers</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-md border border-border p-4 transition-colors hover:bg-secondary/50">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-[10px] text-muted-foreground">{customer.type}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1">
                      <Envelope className="h-3 w-3" /> {customer.email}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                  <span>{customer._count.projects} projects</span>
                  <span>{customer._count.invoices} invoices</span>
                  <span>{customer._count.tickets} tickets</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
