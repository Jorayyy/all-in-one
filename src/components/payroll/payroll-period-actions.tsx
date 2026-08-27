"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { Calculator, Check, Eye } from "@/components/icons";

export function RunPayrollButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      let res = await fetch(`/api/pay-periods/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/payroll/${id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to run payroll");
      }
      const data = await res.json().catch(() => ({}));
      if (data.created === 0) {
        toast.success("Payroll already computed — no new records");
      } else if (data.created != null) {
        toast.success(`Payroll computed (${data.created} records) — SSS/PhilHealth/Pag-IBIG/BIR applied`);
      } else {
        toast.success("Payroll computed — SSS/PhilHealth/Pag-IBIG/BIR applied");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleRun} disabled={loading} title="Compute Payroll (SSS/PhilHealth/Pag-IBIG/BIR)">
      <Calculator className="mr-1.5 h-4 w-4" />
      {loading ? "Computing..." : "Run Payroll"}
    </Button>
  );
}

export function ClosePeriodButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);
    try {
      let res = await fetch(`/api/pay-periods/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/payroll/${id}/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to close period");
      }
      toast.success("Pay period closed");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClose} disabled={loading}>
      <Check className="mr-1.5 h-4 w-4" />
      {loading ? "Closing..." : "Close Period"}
    </Button>
  );
}

export function PayrollPeriodActions({
  id,
  isClosed,
  hasRecords,
}: {
  id: string;
  isClosed: boolean;
  hasRecords: boolean;
}) {
  if (!isClosed && !hasRecords) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <RunPayrollButton id={id} />
        <Link href={`/payroll/${id}`}>
          <Button variant="outline" size="sm">
            <Eye className="mr-1.5 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </div>
    );
  }

  if (!isClosed && hasRecords) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/payroll/${id}`}>
          <Button variant="outline" size="sm">
            <Eye className="mr-1.5 h-4 w-4" />
            View Details
          </Button>
        </Link>
        <ClosePeriodButton id={id} />
      </div>
    );
  }

  // Closed
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/payroll/${id}`}>
        <Button variant="outline" size="sm">
          <Eye className="mr-1.5 h-4 w-4" />
          View Payslips
        </Button>
      </Link>
    </div>
  );
}

export default PayrollPeriodActions;
