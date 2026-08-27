"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { GearSix, Users, Bell, Shield, Database } from "@/components/icons";
import toast from "react-hot-toast";

type Company = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  tinNumber?: string | null;
};

type User = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  employee?: { firstName: string; lastName: string; employeeNumber: string } | null;
};

const ROLES = ["SUPER_ADMIN", "ADMIN", "HR", "PAYROLL", "MANAGER", "EMPLOYEE"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Company");
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    tinNumber: "",
  });

  const fetchData = async () => {
    try {
      const [cRes, uRes] = await Promise.all([fetch("/api/companies"), fetch("/api/users")]);
      if (cRes.ok) {
        const cData = await cRes.json();
        const comp = cData.company as Company | null;
        setCompany(comp);
        if (comp) {
          setForm({
            name: comp.name || "",
            address: comp.address || "",
            phone: comp.phone || "",
            email: comp.email || "",
            website: comp.website || "",
            tinNumber: comp.tinNumber || "",
          });
        }
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use POST/PUT to /api/companies
      const url = company?.id ? `/api/companies/${company.id}` : "/api/companies";
      const method = company?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setCompany(data.company);
      toast.success("Company profile saved");
    } catch (err) {
      toast.error("Failed to save company");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.user.role } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: user.role, isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: data.user.isActive } : u)));
      toast.success(`User ${data.user.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const tabs = [
    { icon: GearSix, label: "Company" },
    { icon: Users, label: "Users" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Roles" },
    { icon: Database, label: "Backup" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage system settings</p>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
              {tabs.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    activeTab === item.label ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "Company" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Company Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <Input
                      label="TIN"
                      value={form.tinNumber}
                      onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
                      placeholder="TIN Number"
                    />
                  </div>
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Company address"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+63..."
                    />
                    <Input
                      label="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="info@company.com"
                    />
                  </div>
                  <Input
                    label="Website"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "Users" && (
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 font-medium text-muted-foreground">Email</th>
                        <th className="pb-3 font-medium text-muted-foreground">Role</th>
                        <th className="pb-3 font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{u.email}</p>
                              {u.employee && (
                                <p className="text-xs text-muted-foreground">
                                  {u.employee.firstName} {u.employee.lastName} ({u.employee.employeeNumber})
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="h-8 rounded-md border border-border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <Badge variant={u.isActive ? "success" : "destructive"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="outline" onClick={() => handleToggleActive(u)}>
                              {u.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Notification preferences will appear here.</p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm">Email notifications</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </label>
                  <label className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm">Push notifications</span>
                    <input type="checkbox" className="h-4 w-4" />
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Roles" && (
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Role definitions and permissions.</p>
                <div className="mt-4 grid gap-2">
                  {ROLES.map((r) => (
                    <div key={r} className="flex items-center justify-between rounded-md border border-border p-3">
                      <span className="text-sm font-medium">{r}</span>
                      <Badge variant="outline">{r === "SUPER_ADMIN" ? "Full access" : r === "EMPLOYEE" ? "Limited" : "Standard"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Backup" && (
            <Card>
              <CardHeader>
                <CardTitle>Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Backup and restore system data.</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Backup started (mock)")}>
                    Create Backup
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast("Restore not implemented")}>
                    Restore
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
