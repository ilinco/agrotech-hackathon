import { useId, type ComponentProps } from "react";
import { Field } from "./Field";

export type TextareaProps = ComponentProps<"textarea"> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Textarea = ({
  label,
  hint,
  error,
  id,
  className = "",
  required,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: TextareaProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const description = [
    describedBy,
    hint && `${fieldId}-hint`,
    error && `${fieldId}-error`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <textarea
        rows={4}
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : invalid}
        aria-describedby={description || undefined}
        className={`min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600 resize-y ${className}`}
      />
    </Field>
  );
};
