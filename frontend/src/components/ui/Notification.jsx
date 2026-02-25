import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const variantMap = {
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    container: "border-rose-200 bg-rose-50 text-rose-900",
    iconColor: "text-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    container: "border-sky-200 bg-sky-50 text-sky-900",
    iconColor: "text-sky-600",
  },
};

function Notification({
  title = "",
  message = "",
  variant = "info",
  onClose = null,
  className = "",
}) {
  const selected = variantMap[variant] || variantMap.info;
  const Icon = selected.icon;

  return (
    <div className={`rounded-xl border px-4 py-3 ${selected.container} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 ${selected.iconColor}`} />
        <div className="flex-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          {message ? <p className={`text-sm ${title ? "mt-0.5" : ""}`}>{message}</p> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-current/80 transition hover:bg-black/5 hover:text-current"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Notification;
