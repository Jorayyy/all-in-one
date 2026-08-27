import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Plus, MapPin, Users, Package } from "@/components/icons";

export default async function LocationsPage() {
  await requireAuth();

  const locations = await db.location.findMany({
    include: {
      _count: { select: { employees: true, stocks: true, assets: true } },
    },
    orderBy: { name: "asc" },
  });

  const typeVariant: Record<string, "default" | "secondary" | "success"> = {
    OFFICE: "default",
    WAREHOUSE: "secondary",
    SITE: "success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Locations</h2>
          <p className="text-sm text-muted-foreground">{locations.length} locations</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant={typeVariant[location.type]}>{location.type}</Badge>
              </div>
              <h3 className="text-sm font-medium">{location.name}</h3>
              {location.address && (
                <p className="mt-1 text-xs text-muted-foreground">{location.address}</p>
              )}
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {location._count.employees}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" /> {location._count.stocks}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
