import type { ComponentProps } from "react";

export type AlertProps = ComponentProps<"div"> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

const tones = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
};

export const Alert = ({
  tone = "neutral",
  className = "",
  role,
  ...props
}: AlertProps) => {
  return (
    <div
      {...props}
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]} ${className}`}
    />
  );
};
