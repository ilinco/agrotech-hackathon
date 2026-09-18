import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from './ChartCard';
import type { AggregateRun } from '@/types/analysis';

type AnalysisHistoryChartProps = {
  runs: AggregateRun[];
};

export const AnalysisHistoryChart = ({ runs }: AnalysisHistoryChartProps) => {
  const data = [...runs]
    .sort(
      (first, second) =>
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime(),
    )
    .map((run) => ({
      id: run.id,
      label: `№${run.id}`,
      date: new Date(run.createdAt).toLocaleDateString('ru-RU'),
      detections: run.detectionsCount,
    }));

  return (
    <ChartCard
      title="Объекты по запускам"
      description="Количество записей обнаружений в каждом анализе за выбранный период."
      className="lg:col-span-2"
    >
      {data.length ? (
        <div
          className="mt-4 h-64 w-full"
          role="img"
          aria-label="Столбчатая диаграмма количества обнаружений по запускам анализа"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -20 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#f0fdf4' }}
                labelFormatter={(label, payload) => {
                  const item = payload[0]?.payload as
                    | { date?: string }
                    | undefined;
                  return `Анализ ${String(label)} · ${item?.date ?? ''}`;
                }}
                formatter={(value) => [Number(value), 'Объектов']}
                contentStyle={{
                  borderColor: '#cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)',
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="detections"
                name="Объектов"
                fill="#166534"
                radius={[5, 5, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          За выбранный период запусков нет.
        </p>
      )}
    </ChartCard>
  );
};
