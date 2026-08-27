"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Select } from "@/components/ui";
import { updateTicketStatus } from "@/actions/tickets";

interface TicketStatusSelectProps {
  ticketId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING", label: "Waiting" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: TicketStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = e.target.value;
    if (nextStatus === status) return;
    setLoading(true);
    const previous = status;
    setStatus(nextStatus);
    try {
      await updateTicketStatus(ticketId, nextStatus as any);
      toast.success(`Ticket status updated to ${nextStatus.replace("_", " ")}`);
      router.refresh();
    } catch (error: any) {
      setStatus(previous);
      toast.error(error?.message || "Failed to update ticket status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select
      value={status}
      onChange={handleChange}
      options={STATUS_OPTIONS as unknown as { value: string; label: string }[]}
      disabled={loading}
      className="h-8 min-w-[150px] text-xs"
      aria-label="Ticket status"
    />
  );
}

export default TicketStatusSelect;
