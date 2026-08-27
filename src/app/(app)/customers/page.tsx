import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Plus, Users, Phone, Envelope } from "@/components/icons";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; type?: string; page?: string }>;

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const type = params.type || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = { deletedAt: null };
  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { phone: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (type) (where as Record<string, unknown>).type = type;

  const [total, customers] = await Promise.all([
    db.customer.count({ where: where as never }),
    db.customer.findMany({
      where: where as never,
      include: { _count: { select: { projects: true, invoices: true, tickets: true } } },
      orderBy: { name: "asc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type) sp.set("type", type);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-sm text-muted-foreground">{total} customers</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
            <Input name="q" placeholder="Search customers..." defaultValue={q} className="h-9 w-full max-w-xs" />
            <select name="type" defaultValue={type} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Types</option>
              <option value="RESIDENTIAL">RESIDENTIAL</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="GOVERNMENT">GOVERNMENT</option>
              <option value="INDUSTRIAL">INDUSTRIAL</option>
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(q || type) && <Link href="/customers" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
          </form>

          {customers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No customers found</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer) => (
                <div key={customer.id} className="rounded-md border border-border p-4 transition-colors hover:bg-secondary/50">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium"><Users className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-[10px] text-muted-foreground">{customer.type}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {customer.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</div>}
                    {customer.email && <div className="flex items-center gap-1"><Envelope className="h-3 w-3" /> {customer.email}</div>}
                  </div>
                  <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                    <span>{customer._count.projects} projects</span>
                    <span>{customer._count.invoices} invoices</span>
                    <span>{customer._count.tickets} tickets</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/customers${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {page < totalPages ? <Link href={`/customers${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
