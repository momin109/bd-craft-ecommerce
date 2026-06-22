import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 mt-2 px-4 py-2 text-sm font-medium text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
