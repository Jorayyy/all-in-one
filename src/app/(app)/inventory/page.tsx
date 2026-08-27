import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { Plus, Search, Filter, Download, Package, AlertTriangle } from "lucide-react";

export default async function InventoryPage() {
  await requireAuth();

  const products = await db.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      stocks: {
        include: { location: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const lowStockProducts = products.filter((p) =>
    p.stocks.some((s) => s.quantity <= p.minStock)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500">{products.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">
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

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Product</th>
                  <th className="pb-3 font-medium text-gray-500">SKU</th>
                  <th className="pb-3 font-medium text-gray-500">Category</th>
                  <th className="pb-3 font-medium text-gray-500">Unit Price</th>
                  <th className="pb-3 font-medium text-gray-500">Stock</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = product.stocks.reduce(
                    (sum, s) => sum + s.quantity,
                    0
                  );
                  const isLow = totalStock <= product.minStock;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.unit}</p>
                      </td>
                      <td className="py-4 text-gray-600">{product.sku}</td>
                      <td className="py-4 text-gray-600">{product.category.name}</td>
                      <td className="py-4 text-gray-600">
                        {formatCurrency(Number(product.unitPrice))}
                      </td>
                      <td className="py-4">
                        <span className={isLow ? "font-bold text-red-600" : ""}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="py-4">
                        <Badge variant={isLow ? "destructive" : "success"}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
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
