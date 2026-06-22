import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin text-brand-600" size={28} />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
          <div className="aspect-[3/4] skeleton" />
          <div className="p-3.5 space-y-2">
            <div className="h-3 w-3/4 skeleton rounded" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
