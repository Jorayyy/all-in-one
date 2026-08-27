import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Calculator } from "@/components/icons";
import Link from "next/link";

export default async function AccountingPage() {
  await requireAuth();

  const accounts = await db.account.findMany({ orderBy: { code: "asc" } });
  const journalEntries = await db.journalEntry.findMany({
    include: { accounts: { include: { account: true } } },
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Accounting</h2>
          <p className="text-sm text-muted-foreground">Chart of accounts and journal entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/accounting/journal/new">
            <Button variant="outline" size="sm">Journal Entry</Button>
          </Link>
          <Link href="/accounting/accounts/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Account
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No accounts yet</p>
            ) : (
              <div className="space-y-1">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <p className="text-sm font-medium">{account.code} - {account.name}</p>
                    <Badge variant="outline">{account.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {journalEntries.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No entries yet</p>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="rounded-md border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">{entry.description}</p>
                      <Badge variant={entry.isPosted ? "success" : "secondary"}>
                        {entry.isPosted ? "Posted" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.date)} {entry.reference && `• ${entry.reference}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
