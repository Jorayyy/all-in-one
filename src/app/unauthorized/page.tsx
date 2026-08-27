import { Button } from "@/components/ui";
import { ShieldOff } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldOff className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
        <Link href="/dashboard">
          <Button className="mt-6">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
