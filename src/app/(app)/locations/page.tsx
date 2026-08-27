import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Plus, MapPin, Users, Package } from "lucide-react";

export default async function LocationsPage() {
  await requireAuth();

  const locations = await db.location.findMany({
    include: {
      _count: {
        select: {
          employees: true,
          stocks: true,
          assets: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const typeColors: Record<string, string> = {
    OFFICE: "default",
    WAREHOUSE: "secondary",
    SITE: "success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
          <p className="text-gray-500">{locations.length} locations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant={typeColors[location.type] as any}>
                  {location.type}
                </Badge>
              </div>

              <h3 className="mb-2 text-lg font-semibold">{location.name}</h3>

              {location.address && (
                <p className="mb-4 text-sm text-gray-500">{location.address}</p>
              )}

              <div className="flex gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {location._count.employees} employees
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {location._count.stocks} items
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
