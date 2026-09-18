import type { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export const ChartCard = ({
  title,
  description,
  children,
  className = '',
}: ChartCardProps) => (
  <section
    className={`min-w-0 rounded-lg border border-slate-200 bg-white p-4 ${className}`}
  >
    <h3 className="text-sm font-medium text-slate-900">{title}</h3>
    <p className="mt-1 text-xs leading-relaxed text-slate-500">
      {description}
    </p>
    {children}
  </section>
);
