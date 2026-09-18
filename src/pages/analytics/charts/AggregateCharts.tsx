import { AnalysisHistoryChart } from './AnalysisHistoryChart';
import { SpeciesDistributionChart } from './SpeciesDistributionChart';
import { StageDistributionChart } from './StageDistributionChart';
import type { AggregateReport } from '@/types/analysis';

type AggregateChartsProps = {
  report: AggregateReport;
};

export const AggregateCharts = ({ report }: AggregateChartsProps) => (
  <section aria-labelledby="analytics-charts-title">
    <div>
      <h2 id="analytics-charts-title" className="text-base font-medium">
        Динамика и распределение
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Диаграммы учитывают выбранное поле и период отчёта.
      </p>
    </div>
    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      <AnalysisHistoryChart runs={report.perRun} />
      <SpeciesDistributionChart bySpecies={report.bySpecies} />
      <StageDistributionChart byStage={report.byStage} />
    </div>
  </section>
);
