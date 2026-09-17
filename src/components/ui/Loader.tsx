export type LoaderProps = { label?: string };

export const Loader = ({ label = "Загрузка…" }: LoaderProps) => {
  return (
    <div
      role="status"
      className="flex items-center gap-2 text-sm text-slate-600"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-green-800 motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  );
};
