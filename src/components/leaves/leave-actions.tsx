"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { Check, X } from "@/components/icons";
import { updateLeaveStatus } from "@/actions/leaves";

interface LeaveActionsProps {
  leaveId: string;
  status: string;
}

export function LeaveActions({ leaveId, status }: LeaveActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function handleUpdate(nextStatus: "APPROVED" | "REJECTED") {
    const remarks = window.prompt(
      `Enter remarks for ${nextStatus === "APPROVED" ? "approval" : "rejection"} (optional):`
    );
    // window.prompt returns null if cancelled — abort action
    if (remarks === null) return;

    setLoading(nextStatus);
    try {
      await updateLeaveStatus(
        leaveId,
        nextStatus as any,
        remarks.trim() || undefined
      );
      toast.success(
        nextStatus === "APPROVED" ? "Leave approved" : "Leave rejected"
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${nextStatus.toLowerCase()} leave`);
    } finally {
      setLoading(null);
    }
  }

  if (status !== "PENDING") return null;

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="success"
        onClick={() => handleUpdate("APPROVED")}
        disabled={!!loading}
        title="Approve"
      >
        <Check className="h-4 w-4" />
        {loading === "APPROVED" ? " Approving..." : ""}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleUpdate("REJECTED")}
        disabled={!!loading}
        title="Reject"
      >
        <X className="h-4 w-4" />
        {loading === "REJECTED" ? " Rejecting..." : ""}
      </Button>
    </div>
  );
}

export default LeaveActions;
