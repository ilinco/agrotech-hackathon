import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { stageLabels } from '@/config/analysisLabels';
import { ChartCard } from './ChartCard';
import type { VegetationStage } from '@/types/analysis';

type StageDistributionChartProps = {
  byStage: Record<string, number>;
};

const colors = ['#166534', '#65a30d', '#d97706', '#94a3b8', '#0f766e'];

const getStageLabel = (stage: string) =>
  stageLabels[stage as VegetationStage] ?? stage;

export const StageDistributionChart = ({
  byStage,
}: StageDistributionChartProps) => {
  const data = Object.entries(byStage)
    .filter(([, count]) => count > 0)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .map(([stage, count], index) => ({
      stage,
      name: getStageLabel(stage),
      count,
      color: colors[index % colors.length],
    }));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard
      title="Стадии вегетации"
      description="Распределение записей обнаружений по стадиям, полученным от модели."
    >
      {data.length ? (
        <>
          <p className="mt-4 text-xs text-slate-500">
            Всего объектов:{' '}
            <span className="font-semibold tabular-nums text-slate-900">
              {total}
            </span>
          </p>
          <div
            className="mt-2 h-56 w-full"
            role="img"
            aria-label="Кольцевая диаграмма обнаружений по стадиям вегетации"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell key={item.stage} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [Number(value), 'Объектов']}
                  contentStyle={{
                    borderColor: '#cbd5e1',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2 text-xs">
            {data.map((item) => (
              <li key={item.stage} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 text-slate-600">
                  {item.name}
                </span>
                <span className="font-medium tabular-nums text-slate-900">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          Данных о стадиях за выбранный период нет.
        </p>
      )}
    </ChartCard>
  );
};
