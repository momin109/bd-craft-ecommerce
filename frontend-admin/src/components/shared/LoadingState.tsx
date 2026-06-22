import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin text-brand-600" size={28} />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function LoadingTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="h-3.5 skeleton rounded flex-1" style={{ maxWidth: c === 0 ? "60px" : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="h-3 w-1/2 skeleton rounded mb-3" />
          <div className="h-7 w-2/3 skeleton rounded" />
        </div>
      ))}
    </div>
  );
}
