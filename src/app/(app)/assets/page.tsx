import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, MagnifyingGlass, Wrench, CheckCircle, Warning } from "@/components/icons";
import Link from "next/link";

export default async function AssetsPage() {
  await requireAuth();

  const assets = await db.asset.findMany({
    where: { deletedAt: null },
    include: { location: true, assignee: true },
    orderBy: { name: "asc" },
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
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
          <h2 className="text-xl font-semibold">Assets</h2>
          <p className="text-sm text-muted-foreground">{assets.length} assets</p>
        </div>
        <Link href="/assets/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets..."
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Asset</th>
                  <th className="pb-3 font-medium text-muted-foreground">Code</th>
                  <th className="pb-3 font-medium text-muted-foreground">Location</th>
                  <th className="pb-3 font-medium text-muted-foreground">Assignee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Next Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-border">
                    <td className="py-3">
                      <p className="font-medium">{asset.name}</p>
                      {asset.serialNumber && (
                        <p className="text-xs text-muted-foreground">SN: {asset.serialNumber}</p>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground">{asset.code}</td>
                    <td className="py-3 text-muted-foreground">{asset.location?.name || "-"}</td>
                    <td className="py-3 text-muted-foreground">
                      {asset.assignee
                        ? `${asset.assignee.firstName} ${asset.assignee.lastName}`
                        : "-"}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[asset.status]}>
                        {asset.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {asset.nextMaintenance ? formatDate(asset.nextMaintenance) : "-"}
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
