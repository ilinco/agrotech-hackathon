import type { ComponentProps } from "react";

export type BadgeProps = ComponentProps<"span"> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

const tones = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export const Badge = ({
  tone = "neutral",
  className = "",
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    />
  );
};
