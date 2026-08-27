import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

export default async function AssetsPage() {
  await requireAuth();

  const assets = await db.asset.findMany({
    where: { deletedAt: null },
    include: {
      location: true,
      assignee: true,
      maintenanceLogs: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const stats = {
    total: assets.length,
    available: assets.filter((a) => a.status === "AVAILABLE").length,
    inUse: assets.filter((a) => a.status === "IN_USE").length,
    maintenance: assets.filter((a) => a.status === "MAINTENANCE").length,
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: "success",
    IN_USE: "default",
    MAINTENANCE: "warning",
    RETIRED: "secondary",
    LOST: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
          <p className="text-gray-500">{assets.length} total assets</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Wrench className="h-5 w-5" />
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
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Use</p>
                <p className="text-2xl font-bold">{stats.inUse}</p>
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
                <p className="text-sm text-gray-500">Maintenance</p>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
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
                  <th className="pb-3 font-medium text-gray-500">Asset</th>
                  <th className="pb-3 font-medium text-gray-500">Code</th>
                  <th className="pb-3 font-medium text-gray-500">Location</th>
                  <th className="pb-3 font-medium text-gray-500">Assignee</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Next Maintenance</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <p className="font-medium">{asset.name}</p>
                      {asset.serialNumber && (
                        <p className="text-xs text-gray-500">
                          SN: {asset.serialNumber}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-gray-600">{asset.code}</td>
                    <td className="py-4 text-gray-600">
                      {asset.location?.name || "-"}
                    </td>
                    <td className="py-4 text-gray-600">
                      {asset.assignee
                        ? `${asset.assignee.firstName} ${asset.assignee.lastName}`
                        : "-"}
                    </td>
                    <td className="py-4">
                      <Badge variant={statusColors[asset.status] as any}>
                        {asset.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-600">
                      {asset.nextMaintenance
                        ? formatDate(asset.nextMaintenance)
                        : "-"}
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
