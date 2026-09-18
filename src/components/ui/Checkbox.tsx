import { useId, type ComponentProps } from "react";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label?: string;
};

export const Checkbox = ({
  label,
  id,
  className = "",
  ...props
}: CheckboxProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex items-start gap-2.5">
      <input
        {...props}
        id={fieldId}
        type="checkbox"
        className={`mt-0.5 size-4 shrink-0 cursor-pointer accent-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      {label && (
        <label
          htmlFor={fieldId}
          className={`text-sm ${props.disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-slate-700"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
