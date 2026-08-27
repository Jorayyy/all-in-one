import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { Plus, MagnifyingGlass, Package, Warning } from "@/components/icons";
import Link from "next/link";

export default async function InventoryPage() {
  await requireAuth();

  const products = await db.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      stocks: { include: { location: true } },
    },
    orderBy: { name: "asc" },
  });

  const lowStock = products.filter((p) =>
    p.stocks.some((s) => s.quantity <= p.minStock)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
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
              <div className="rounded-md bg-secondary p-2 text-muted-foreground">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-xl font-semibold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-warning/10 p-2 text-warning">
                <Warning className="h-4 w-4" />
              </div>
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
              <div className="rounded-md bg-success/10 p-2 text-success">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(
                    products.reduce(
                      (sum, p) =>
                        sum +
                        Number(p.unitPrice) *
                          p.stocks.reduce((s, st) => s + st.quantity, 0),
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

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
                {products.map((product) => {
                  const totalStock = product.stocks.reduce((sum, s) => sum + s.quantity, 0);
                  const isLow = totalStock <= product.minStock;
                  return (
                    <tr key={product.id} className="border-b border-border">
                      <td className="py-3 font-medium">{product.name}</td>
                      <td className="py-3 text-muted-foreground">{product.sku}</td>
                      <td className="py-3 text-muted-foreground">{product.category.name}</td>
                      <td className="py-3">{formatCurrency(Number(product.unitPrice))}</td>
                      <td className="py-3">
                        <span className={isLow ? "font-semibold text-destructive" : ""}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge variant={isLow ? "destructive" : "success"}>
                          {isLow ? "Low" : "In Stock"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
