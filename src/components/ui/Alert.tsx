import { CircleAlert, Info, TriangleAlert, CheckCircle2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export type AlertProps = ComponentProps<"div"> & {
  tone?: "neutral" | "success" | "warning" | "danger";
  title?: string;
  action?: ReactNode;
};

const tones = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
};

export const Alert = ({
  tone = "neutral",
  title,
  action,
  className = "",
  role,
  children,
  ...props
}: AlertProps) => {
  const Icon = {
    neutral: Info,
    success: CheckCircle2,
    warning: TriangleAlert,
    danger: CircleAlert,
  }[tone];

  return (
    <div
      {...props}
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}
    >
      {title ? (
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
          <Icon aria-hidden="true" className="mt-0.5 size-5" />
          <div className="min-w-0">
            <p className="font-semibold">{title}</p>
            <div className="mt-1 leading-relaxed opacity-90">{children}</div>
          </div>
          {action && <div className="self-center">{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
