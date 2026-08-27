import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Plus, Search, Filter, Users, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage() {
  await requireAuth();

  const customers = await db.customer.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: {
          projects: true,
          invoices: true,
          tickets: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">{customers.length} total customers</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {customer.type}
                  </span>
                </div>

                <h3 className="mb-2 font-semibold">{customer.name}</h3>

                <div className="mb-3 space-y-1 text-sm text-gray-500">
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{customer._count.projects} projects</span>
                  <span>{customer._count.invoices} invoices</span>
                  <span>{customer._count.tickets} tickets</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
