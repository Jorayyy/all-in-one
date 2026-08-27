import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { GearSix, Users, Bell, Shield, Database } from "phosphor-react";

export default async function SettingsPage() {
  await requireAuth();

  const company = await db.company.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage system settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {[
                { icon: GearSix, label: "Company", active: true },
                { icon: Users, label: "Users", active: false },
                { icon: Bell, label: "Notifications", active: false },
                { icon: Shield, label: "Roles", active: false },
                { icon: Database, label: "Backup", active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    item.active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Company Name" defaultValue={company?.name || ""} />
                  <Input label="TIN" defaultValue={company?.tinNumber || ""} />
                </div>
                <Input label="Address" defaultValue={company?.address || ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Phone" defaultValue={company?.phone || ""} />
                  <Input label="Email" defaultValue={company?.email || ""} type="email" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
