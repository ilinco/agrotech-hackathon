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

type SpeciesDistributionChartProps = {
  bySpecies: Record<string, number>;
};

const MAX_VISIBLE_SPECIES = 7;

export const SpeciesDistributionChart = ({
  bySpecies,
}: SpeciesDistributionChartProps) => {
  const sorted = Object.entries(bySpecies).sort(
    ([, firstCount], [, secondCount]) => secondCount - firstCount,
  );
  const visible = sorted.slice(0, MAX_VISIBLE_SPECIES).map(([name, count]) => ({
    name,
    count,
  }));
  const otherCount = sorted
    .slice(MAX_VISIBLE_SPECIES)
    .reduce((sum, [, count]) => sum + count, 0);
  const data = otherCount
    ? [...visible, { name: 'Остальные', count: otherCount }]
    : visible;
  const chartHeight = Math.max(220, data.length * 42);

  return (
    <ChartCard
      title="Распределение по видам"
      description="Количество записей обнаружений для каждого определённого вида."
    >
      {data.length ? (
        <div
          className="mt-4 w-full"
          style={{ height: chartHeight }}
          role="img"
          aria-label="Горизонтальная диаграмма обнаружений по видам"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 12 }}
                tickFormatter={(value: string) =>
                  value.length > 17 ? `${value.slice(0, 16)}…` : value
                }
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                formatter={(value) => [Number(value), 'Объектов']}
                contentStyle={{
                  borderColor: '#cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)',
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                name="Объектов"
                fill="#15803d"
                radius={[0, 5, 5, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          Данных о видах за выбранный период нет.
        </p>
      )}
    </ChartCard>
  );
};
