import type { ComponentProps } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

const variants = {
  primary: "border-green-800 bg-green-800 text-white hover:bg-green-900",
  secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "border-red-700 bg-red-700 text-white hover:bg-red-800",
};

export const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none cursor-pointer ${variants[variant]} ${size === "sm" ? "min-h-9 px-3 py-1.5" : "min-h-10 px-4 py-2"} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  );
};
