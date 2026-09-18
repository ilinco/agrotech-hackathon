export type LoaderProps = { label?: string };

export const Loader = ({ label = "Загрузка…" }: LoaderProps) => {
  return (
    <div
      role="status"
      className="flex min-h-6 items-center gap-2.5 text-sm text-slate-600"
    >
      <span
        aria-hidden="true"
        className="size-5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-green-800 [animation-duration:800ms] motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  );
};
