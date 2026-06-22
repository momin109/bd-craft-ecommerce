"use client";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", isLoading, danger, onConfirm, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-brand-50"}`}>
          <AlertTriangle size={20} className={danger ? "text-red-500" : "text-brand-600"} />
        </div>
        <h3 className="font-serif text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
        {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-700 hover:bg-brand-800"}`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
