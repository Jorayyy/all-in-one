import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Settings, Building2, Bell, Shield, Database } from "lucide-react";

export default async function SettingsPage() {
  const session = await requireAuth();

  const company = await db.company.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your system settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-1">
              {[
                { icon: Building2, label: "Company Profile", active: true },
                { icon: Users, label: "User Management", active: false },
                { icon: Bell, label: "Notifications", active: false },
                { icon: Shield, label: "Roles & Permissions", active: false },
                { icon: Database, label: "Backup & Export", active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Company Name"
                    defaultValue={company?.name || ""}
                  />
                  <Input
                    label="TIN Number"
                    defaultValue={company?.tinNumber || ""}
                  />
                </div>
                <Input
                  label="Address"
                  defaultValue={company?.address || ""}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Phone"
                    defaultValue={company?.phone || ""}
                  />
                  <Input
                    label="Email"
                    defaultValue={company?.email || ""}
                    type="email"
                  />
                </div>
                <Input
                  label="Website"
                  defaultValue={company?.website || ""}
                />
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
