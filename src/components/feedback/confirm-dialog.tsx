import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "warning";
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary-100 text-primary-600",
    button: "bg-primary-600 text-white hover:bg-primary-700",
  },
  destructive: {
    icon: "bg-danger-100 text-danger-600",
    button: "bg-danger-600 text-white hover:bg-danger-700",
  },
  warning: {
    icon: "bg-warning-100 text-warning-600",
    button: "bg-warning-600 text-white hover:bg-warning-700",
  },
};

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}: ConfirmDialogProps) {
  if (!open) return null;

  const styles = variantStyles[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn("relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg", className)}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              styles.icon
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            {description && <div className="mt-2 text-sm text-slate-600">{description}</div>}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
            }}
            disabled={isLoading}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50",
              styles.button
            )}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmDialog };
