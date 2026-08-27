import { Building2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-white" />
          <h1 className="mt-4 text-4xl font-bold text-white">PRIME</h1>
          <p className="mt-2 text-lg text-blue-100">
            Business Management System
          </p>
          <div className="mt-8 space-y-2 text-blue-200">
            <p>• HR & Payroll</p>
            <p>• Inventory & Sales</p>
            <p>• Projects & Tickets</p>
            <p>• Accounting & Reports</p>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
