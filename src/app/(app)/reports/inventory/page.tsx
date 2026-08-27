import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

function ReportFilters({ from, to, q }: { from?: string; to?: string; q?: string }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <div className="min-w-[180px] flex-1">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Product or SKU"
          className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input
          type="date"
          name="from"
          defaultValue={from || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input
          type="date"
          name="to"
          defaultValue={to || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Filter
      </Button>
      {(from || to || q) && (
        <Link href="/reports/inventory">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

export default async function InventoryReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string; q?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const from = params.from || "";
  const to = params.to || "";
  const q = params.q?.trim() || "";

  const where: any = { deletedAt: null };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const products = await db.product.findMany({
    where,
    include: { category: true, stocks: true },
    orderBy: { name: "asc" },
    take: 1000,
  });

  const totalValuation = products.reduce(
    (sum, p) => sum + Number(p.costPrice) * p.stocks.reduce((s, st) => s + st.quantity, 0),
    0
  );
  const totalRetail = products.reduce(
    (sum, p) => sum + Number(p.unitPrice) * p.stocks.reduce((s, st) => s + st.quantity, 0),
    0
  );
  const lowStock = products.filter((p) => p.stocks.reduce((s, st) => s + st.quantity, 0) <= p.minStock);

  const categoryBreakdown: Record<string, { count: number; valuation: number; stock: number }> = {};
  for (const p of products) {
    const cat = p.category.name;
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, valuation: 0, stock: 0 };
    const stock = p.stocks.reduce((s, st) => s + st.quantity, 0);
    categoryBreakdown[cat].count++;
    categoryBreakdown[cat].stock += stock;
    categoryBreakdown[cat].valuation += Number(p.costPrice) * stock;
  }

  const exportData = products.map((p) => {
    const stock = p.stocks.reduce((s, st) => s + st.quantity, 0);
    return {
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      unitPrice: String(p.unitPrice),
      costPrice: String(p.costPrice),
      totalStock: stock,
      minStock: p.minStock,
      valuation: String(Number(p.costPrice) * stock),
      status: stock <= p.minStock ? "Low Stock" : stock === 0 ? "Out of Stock" : "In Stock",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Inventory Report</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} products • {lowStock.length} low stock
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="inventory-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-bold text-destructive">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Stock Valuation (Cost)</p>
            <p className="text-lg font-bold">{formatCurrency(totalValuation)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Retail Value</p>
            <p className="text-lg font-bold">{formatCurrency(totalRetail)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground">Products</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Valuation</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryBreakdown).map(([cat, v]) => (
                  <tr key={cat} className="border-b border-border">
                    <td className="py-3 font-medium">{cat}</td>
                    <td className="py-3">{v.count}</td>
                    <td className="py-3">{v.stock}</td>
                    <td className="py-3">{formatCurrency(v.valuation)}</td>
                  </tr>
                ))}
                {Object.keys(categoryBreakdown).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Low Stock List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">SKU</th>
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Min</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 100).map((p) => {
                  const stock = p.stocks.reduce((s, st) => s + st.quantity, 0);
                  return (
                    <tr key={p.id} className="border-b border-border">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.sku}</td>
                      <td className="py-3 font-semibold text-destructive">{stock}</td>
                      <td className="py-3">{p.minStock}</td>
                      <td className="py-3">
                        <Badge variant="destructive">Low</Badge>
                      </td>
                    </tr>
                  );
                })}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-success">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters from={from} to={to} q={q} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">SKU</th>
                  <th className="pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Valuation</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = p.stocks.reduce((s, st) => s + st.quantity, 0);
                  const isLow = stock <= p.minStock;
                  return (
                    <tr key={p.id} className="border-b border-border">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.sku}</td>
                      <td className="py-3 text-muted-foreground">{p.category.name}</td>
                      <td className="py-3">{formatCurrency(Number(p.unitPrice))}</td>
                      <td className="py-3 font-medium">{stock}</td>
                      <td className="py-3">{formatCurrency(Number(p.costPrice) * stock)}</td>
                      <td className="py-3">
                        <Badge variant={isLow ? "destructive" : "success"}>{isLow ? "Low" : "OK"}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
