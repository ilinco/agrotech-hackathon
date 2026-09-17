import type { ComponentProps } from "react";

export type ContainerProps = ComponentProps<"div">;

export const Container = ({
  children,
  className = "",
  ...props
}: ContainerProps) => {
  return (
    <div
      {...props}
      className={`mx-auto w-full min-w-0 max-w-700 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};
