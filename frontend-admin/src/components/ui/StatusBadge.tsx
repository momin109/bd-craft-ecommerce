import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  // Order statuses
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-100",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  DELIVERED: "bg-green-50 text-green-700 border-green-100",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  // Payment / generic
  PAID: "bg-green-50 text-green-700 border-green-100",
  UNPAID: "bg-gray-100 text-gray-500 border-gray-200",
  FAILED: "bg-red-50 text-red-700 border-red-100",
  // Review / coupon / offer / notification statuses
  ACTIVE: "bg-green-50 text-green-700 border-green-100",
  INACTIVE: "bg-gray-100 text-gray-500 border-gray-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-100",
  HIDDEN: "bg-gray-100 text-gray-500 border-gray-200",
  SENT: "bg-green-50 text-green-700 border-green-100",
  SKIPPED: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
      STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
    )}>
      {status}
    </span>
  );
}
