import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Filter, Calculator, TrendingUp, TrendingDown } from "lucide-react";

export default async function AccountingPage() {
  await requireAuth();

  const accounts = await db.account.findMany({
    orderBy: { code: "asc" },
  });

  const journalEntries = await db.journalEntry.findMany({
    include: {
      accounts: {
        include: { account: true },
      },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  const accountTypes = {
    ASSET: accounts.filter((a) => a.type === "ASSET"),
    LIABILITY: accounts.filter((a) => a.type === "LIABILITY"),
    EQUITY: accounts.filter((a) => a.type === "EQUITY"),
    INCOME: accounts.filter((a) => a.type === "INCOME"),
    EXPENSE: accounts.filter((a) => a.type === "EXPENSE"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounting</h2>
          <p className="text-gray-500">Chart of accounts and journal entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Journal Entry</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>
      </div>

      {/* Account Types */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(accountTypes).map(([type, accounts]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    type === "ASSET"
                      ? "bg-blue-100 text-blue-600"
                      : type === "LIABILITY"
                      ? "bg-red-100 text-red-600"
                      : type === "EQUITY"
                      ? "bg-purple-100 text-purple-600"
                      : type === "INCOME"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{type}</p>
                  <p className="text-2xl font-bold">{accounts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart of Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chart of Accounts</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accounts.length === 0 ? (
                <p className="py-4 text-center text-gray-500">
                  No accounts configured. Create your chart of accounts to get
                  started.
                </p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {account.code} - {account.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        account.type === "ASSET"
                          ? "default"
                          : account.type === "LIABILITY"
                          ? "destructive"
                          : account.type === "INCOME"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {account.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {journalEntries.length === 0 ? (
                <p className="py-4 text-center text-gray-500">
                  No journal entries yet
                </p>
              ) : (
                journalEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium">{entry.description}</p>
                      <Badge variant={entry.isPosted ? "success" : "secondary"}>
                        {entry.isPosted ? "Posted" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(entry.date)}{" "}
                      {entry.reference && `• ${entry.reference}`}
                    </p>
                    <div className="mt-2 space-y-1">
                      {entry.accounts.map((ea) => (
                        <div
                          key={ea.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {ea.account.code} - {ea.account.name}
                          </span>
                          <span>
                            {Number(ea.debit) > 0 && (
                              <span className="text-green-600">
                                {formatCurrency(Number(ea.debit))} DR
                              </span>
                            )}
                            {Number(ea.credit) > 0 && (
                              <span className="text-red-600">
                                {formatCurrency(Number(ea.credit))} CR
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
