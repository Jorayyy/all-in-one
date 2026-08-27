"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash, X } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface Line {
  accountId: string;
  debit: string;
  credit: string;
}

export default function CreateJournalEntryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    reference: "",
  });

  const [lines, setLines] = useState<Line[]>([
    { accountId: "", debit: "", credit: "" },
    { accountId: "", debit: "", credit: "" },
  ]);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        setAccounts(data.accounts || []);
      } catch {
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    }
    fetchAccounts();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLineChange = (index: number, field: keyof Line, value: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { accountId: "", debit: "", credit: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error("At least 2 lines are required");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBalanced) {
      toast.error(`Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})`);
      return;
    }

    for (const line of lines) {
      if (!line.accountId) {
        toast.error("Each line must have an account selected");
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          description: form.description,
          reference: form.reference || undefined,
          lines: lines.map((l) => ({
            accountId: l.accountId,
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create journal entry");
      }

      toast.success("Journal entry created successfully");
      router.push("/accounting");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/accounting">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Journal Entry</h1>
          <p className="text-muted-foreground">Add a new journal entry with balanced debits and credits</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entry Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Input type="date" name="date" value={form.date} onChange={handleFormChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Reference</label>
                <Input
                  name="reference"
                  value={form.reference}
                  onChange={handleFormChange}
                  placeholder="e.g. REF-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={2}
                required
                placeholder="Journal entry description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Lines</h3>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" /> Add Line
                </Button>
              </div>

              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto] items-end rounded-md border border-border p-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Account *</label>
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, "accountId", e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">{loadingAccounts ? "Loading..." : "Select account"}</option>
                        {accounts.map((acct) => (
                          <option key={acct.id} value={acct.id}>
                            {acct.code} - {acct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Debit</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit}
                        onChange={(e) => handleLineChange(idx, "debit", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Credit</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit}
                        onChange={(e) => handleLineChange(idx, "credit", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(idx)}
                      className="mb-0.5"
                      title="Remove line"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
                <div className="flex gap-6">
                  <span>
                    Total Debit: <strong>{totalDebit.toFixed(2)}</strong>
                  </span>
                  <span>
                    Total Credit: <strong>{totalCredit.toFixed(2)}</strong>
                  </span>
                </div>
                <span className={isBalanced ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                  {isBalanced ? "Balanced" : "Not Balanced"}
                </span>
              </div>
              {!isBalanced && (
                <p className="text-xs text-destructive">Debits must equal credits before submitting</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !isBalanced}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create Journal Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
