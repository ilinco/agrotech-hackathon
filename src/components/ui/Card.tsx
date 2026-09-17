import type { ComponentProps } from "react";

export type CardProps = ComponentProps<"div">;

export const Card = ({ className = "", ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={`rounded-lg border border-slate-200 bg-white p-4 text-slate-900 ${className}`}
    />
  );
};
