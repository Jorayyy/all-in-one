import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus } from "@/components/icons";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; status?: string; locationId?: string; page?: string }>;

export default async function AssetsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "";
  const locationId = params.locationId || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = { deletedAt: null };
  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: "insensitive" as const } },
      { code: { contains: q, mode: "insensitive" as const } },
      { serialNumber: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (status) (where as Record<string, unknown>).status = status;
  if (locationId) (where as Record<string, unknown>).locationId = locationId;

  const [total, assets, locations] = await Promise.all([
    db.asset.count({ where: where as never }),
    db.asset.findMany({
      where: where as never,
      include: { location: true, assignee: true },
      orderBy: { name: "asc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    db.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    AVAILABLE: "success",
    IN_USE: "default",
    MAINTENANCE: "warning",
    RETIRED: "secondary",
    LOST: "destructive",
  };

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (locationId) sp.set("locationId", locationId);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Assets</h2>
          <p className="text-sm text-muted-foreground">{total} assets</p>
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
          <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
            <Input name="q" placeholder="Search assets..." defaultValue={q} className="h-9 w-full max-w-xs" />
            <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="IN_USE">IN_USE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="RETIRED">RETIRED</option>
              <option value="LOST">LOST</option>
            </select>
            <select name="locationId" defaultValue={locationId} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(q || status || locationId) && <Link href="/assets" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
          </form>

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
                {assets.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No assets found</td></tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-border">
                      <td className="py-3">
                        <p className="font-medium">{asset.name}</p>
                        {asset.serialNumber && <p className="text-xs text-muted-foreground">SN: {asset.serialNumber}</p>}
                      </td>
                      <td className="py-3 text-muted-foreground">{asset.code}</td>
                      <td className="py-3 text-muted-foreground">{asset.location?.name || "-"}</td>
                      <td className="py-3 text-muted-foreground">{asset.assignee ? `${asset.assignee.firstName} ${asset.assignee.lastName}` : "-"}</td>
                      <td className="py-3"><Badge variant={statusVariant[asset.status]}>{asset.status.replace("_", " ")}</Badge></td>
                      <td className="py-3 text-muted-foreground">{asset.nextMaintenance ? formatDate(asset.nextMaintenance) : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/assets${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {page < totalPages ? <Link href={`/assets${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
