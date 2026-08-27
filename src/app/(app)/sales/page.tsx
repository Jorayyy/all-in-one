import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Filter, DollarSign, TrendingUp, Clock } from "lucide-react";

export default async function SalesPage() {
  await requireAuth();

  const invoices = await db.invoice.findMany({
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const quotations = await db.quotation.findMany({
    include: {
      customer: true,
    },
    where: { status: { in: ["DRAFT", "SENT"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = {
    totalRevenue: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.total), 0),
    pendingAmount: invoices
      .filter((i) => i.status === "PENDING" || i.status === "PARTIAL")
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.amountPaid)), 0),
    pendingInvoices: invoices.filter(
      (i) => i.status === "PENDING" || i.status === "PARTIAL"
    ).length,
  };

  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    PENDING: "warning",
    PARTIAL: "warning",
    PAID: "success",
    OVERDUE: "destructive",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales & Invoicing</h2>
          <p className="text-gray-500">Manage quotations, invoices, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">New Quotation</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Collection</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 10).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-gray-500">{invoice.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(Number(invoice.total))}
                    </p>
                    <Badge variant={statusColors[invoice.status] as any}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotations.length === 0 ? (
                <p className="py-4 text-center text-gray-500">
                  No pending quotations
                </p>
              ) : (
                quotations.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{quote.number}</p>
                      <p className="text-sm text-gray-500">{quote.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(quote.total))}
                      </p>
                      <Badge variant={quote.status === "DRAFT" ? "secondary" : "warning"}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
