import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { Plus, Package, Warning } from "@/components/icons";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; categoryId?: string; lowStock?: string; page?: string }>;

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const categoryId = params.categoryId || "";
  const lowStockFilter = params.lowStock === "true";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = { deletedAt: null };
  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: "insensitive" as const } },
      { sku: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (categoryId) (where as Record<string, unknown>).categoryId = categoryId;

  const [categories, count] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.count({ where: where as never }),
  ]);

  let productsRaw = await db.product.findMany({
    where: where as never,
    include: { category: true, stocks: { include: { location: true } } },
    orderBy: { name: "asc" },
  });

  // client-side lowStock filter after fetch
  if (lowStockFilter) {
    productsRaw = productsRaw.filter((p) => {
      const totalStock = p.stocks.reduce((s, st) => s + st.quantity, 0);
      return totalStock <= p.minStock;
    });
  }

  const total = productsRaw.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const products = productsRaw.slice((safePage - 1) * perPage, safePage * perPage);

  const lowStock = productsRaw.filter((p) => p.stocks.some((s) => s.quantity <= p.minStock));

  const totalValue = productsRaw.reduce((sum, p) => sum + Number(p.unitPrice) * p.stocks.reduce((s, st) => s + st.quantity, 0), 0);

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (categoryId) sp.set("categoryId", categoryId);
    if (lowStockFilter) sp.set("lowStock", "true");
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{count} products</p>
        </div>
        <Link href="/inventory/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2 text-muted-foreground"><Package className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-xl font-semibold">{count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-warning/10 p-2 text-warning"><Warning className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-xl font-semibold">{lowStock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-success/10 p-2 text-success"><Package className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-semibold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
            <Input name="q" placeholder="Search name or SKU..." defaultValue={q} className="h-9 w-full max-w-xs" />
            <select name="categoryId" defaultValue={categoryId} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select name="lowStock" defaultValue={lowStockFilter ? "true" : ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Stock</option>
              <option value="true">Low Stock only</option>
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(q || categoryId || lowStockFilter) && (
              <Link href="/inventory" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>
            )}
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">SKU</th>
                  <th className="pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No products found</td></tr>
                ) : (
                  products.map((product) => {
                    const totalStock = product.stocks.reduce((sum, s) => sum + s.quantity, 0);
                    const isLow = totalStock <= product.minStock;
                    return (
                      <tr key={product.id} className="border-b border-border">
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="py-3 text-muted-foreground">{product.sku}</td>
                        <td className="py-3 text-muted-foreground">{product.category.name}</td>
                        <td className="py-3">{formatCurrency(Number(product.unitPrice))}</td>
                        <td className="py-3"><span className={isLow ? "font-semibold text-destructive" : ""}>{totalStock}</span></td>
                        <td className="py-3"><Badge variant={isLow ? "destructive" : "success"}>{isLow ? "Low" : "In Stock"}</Badge></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {safePage} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {safePage > 1 ? <Link href={`/inventory${buildQuery(safePage - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {safePage < totalPages ? <Link href={`/inventory${buildQuery(safePage + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
