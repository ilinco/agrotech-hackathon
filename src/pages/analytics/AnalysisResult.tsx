import { Download, Image, MapPin, TriangleAlert } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnalysisDetectionMap } from '@/pages/analytics/AnalysisDetectionMap';
import {
  analysisStatusLabels,
  lifecycleLabels,
  stageLabels,
  taxonClassLabels,
} from '@/config/analysisLabels';
import type { Field } from '@/types/field';
import type { AnalysisMap, AnalysisRun } from '@/types/analysis';

type AnalysisResultProps = {
  field: Field;
  run: AnalysisRun;
  map?: AnalysisMap;
  selectedDetectionId?: number;
  downloading?: boolean;
  onSelectDetection: (id: number) => void;
  onDownload: (kind: 'json' | 'csv' | 'pdf') => void;
  onDownloadAnnotated: (photoId: number) => void;
};

const number = (value: number | null | undefined, digits = 2) =>
  value === null || value === undefined
    ? 'Не определено'
    : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(
        value,
      );

const statusTone = (status: AnalysisRun['status']) => {
  if (status === 'DONE') return 'success' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'warning' as const;
};

export const AnalysisResult = ({
  field,
  run,
  map,
  selectedDetectionId,
  downloading,
  onSelectDetection,
  onDownload,
  onDownloadAnnotated,
}: AnalysisResultProps) => {
  const recommendation = run.sprayRecommendation;
  const infestation = run.infestation;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Анализ №{run.id}</h2>
            <Badge tone={statusTone(run.status)}>
              {analysisStatusLabels[run.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Создан {new Date(run.createdAt).toLocaleString('ru-RU')}
          </p>
        </div>
        {run.status === 'DONE' && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              loading={downloading}
              onClick={() => onDownload('json')}
            >
              JSON
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={downloading}
              onClick={() => onDownload('csv')}
            >
              CSV
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={downloading}
              onClick={() => onDownload('pdf')}
            >
              <Download aria-hidden="true" className="size-4" />
              PDF
            </Button>
          </div>
        )}
      </div>

      {run.status === 'FAILED' && (
        <Alert tone="danger" title="Анализ завершился с ошибкой">
          {run.errorMessage ?? 'Backend не вернул описание ошибки.'}
        </Alert>
      )}

      {(run.status === 'PENDING' || run.status === 'RUNNING') && (
        <Alert tone="warning" title="Анализ выполняется">
          Страница автоматически проверяет состояние. Точный процент выполнения
          backend не предоставляет.
        </Alert>
      )}

      {run.status === 'DONE' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Обнаружено объектов</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {run.detections.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Сорняков</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {infestation?.weedCount ?? '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Покрытие сорняками</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {infestation?.coveragePercent === null ||
                infestation?.coveragePercent === undefined
                  ? 'Не определено'
                  : `${number(infestation.coveragePercent)}%`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Уровень засорённости</p>
              <p className="mt-2 text-base font-semibold capitalize">
                {recommendation?.densityLevel ??
                  infestation?.level ??
                  'Не определено'}
              </p>
            </div>
          </div>

          {recommendation && (
            <section className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-800">
                    Рекомендация сервиса
                  </p>
                  <h3 className="mt-1 text-lg font-semibold capitalize text-green-950">
                    {recommendation.action ?? 'Не определено'}
                  </h3>
                </div>
                {recommendation.dosagePercent !== null && (
                  <Badge tone="success">
                    Дозировка: {recommendation.dosagePercent}%
                  </Badge>
                )}
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-green-800">Площадь анализа</dt>
                  <dd className="font-medium">
                    {number(recommendation.areaM2)} м²
                  </dd>
                </div>
                <div>
                  <dt className="text-green-800">Малолетние</dt>
                  <dd className="font-medium">
                    {number(recommendation.annualDensityPerM2, 4)} шт/м²
                  </dd>
                </div>
                <div>
                  <dt className="text-green-800">Многолетние</dt>
                  <dd className="font-medium">
                    {number(recommendation.perennialDensityPerM2, 4)} шт/м²
                  </dd>
                </div>
                <div>
                  <dt className="text-green-800">Не классифицировано</dt>
                  <dd className="font-medium">
                    {recommendation.unclassifiedCount}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {recommendation?.warnings.map((warning) => (
            <Alert key={warning} tone="warning" title="Важное ограничение">
              {warning}
            </Alert>
          ))}

          {run.summary && (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-medium">Резюме анализа</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {run.summary}
              </p>
            </section>
          )}

          {map && map.detections.length > 0 && (
            <section className="space-y-3">
              <div>
                <h3 className="font-medium">Обнаружения на карте</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Нанесено {map.meta.detectionsMapped} из{' '}
                  {map.meta.detectionsTotal}. Координаты рассчитаны приближённо.
                </p>
              </div>
              <AnalysisDetectionMap
                field={field}
                detections={map.detections}
                selectedDetectionId={selectedDetectionId}
                onSelectDetection={onSelectDetection}
              />
              {map.meta.notes.map((note) => (
                <p
                  key={note}
                  className="flex gap-2 text-xs leading-relaxed text-slate-500"
                >
                  <TriangleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0"
                  />
                  {note}
                </p>
              ))}
            </section>
          )}

          <section>
            <h3 className="font-medium">Список обнаружений</h3>
            {run.detections.length ? (
              <ul className="mt-3 grid max-h-[32rem] gap-2 overflow-y-auto sm:grid-cols-2">
                {run.detections.map((detection) => (
                  <li key={detection.id}>
                    <button
                      type="button"
                      aria-pressed={selectedDetectionId === detection.id}
                      onClick={() => onSelectDetection(detection.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-green-700 ${selectedDetectionId === detection.id ? 'border-green-700 bg-green-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {detection.species?.name ??
                            detection.speciesGuess ??
                            'Не определено'}
                        </p>
                        <Badge tone={detection.isWeed ? 'warning' : 'success'}>
                          {detection.isWeed ? 'Сорняк' : 'Культура'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {stageLabels[detection.stage]} · уверенность{' '}
                        {number(detection.confidence * 100, 1)}%
                      </p>
                      {detection.species && (
                        <p className="mt-1 text-xs text-slate-500">
                          {detection.species.taxonClass
                            ? taxonClassLabels[detection.species.taxonClass]
                            : 'Класс не определён'}{' '}
                          ·{' '}
                          {detection.species.lifecycle
                            ? lifecycleLabels[detection.species.lifecycle]
                            : 'Цикл не определён'}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Сорняки и культуры не обнаружены.
              </p>
            )}
          </section>

          {run.photos.some((item) => item.annotatedPath) && (
            <section>
              <h3 className="font-medium">Аннотированные снимки</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {run.photos
                  .filter((item) => item.annotatedPath)
                  .map((item) => (
                    <Button
                      key={item.photoId}
                      size="sm"
                      variant="secondary"
                      loading={downloading}
                      onClick={() => onDownloadAnnotated(item.photoId)}
                    >
                      <Image aria-hidden="true" className="size-4" />
                      {item.photo.originalName}
                    </Button>
                  ))}
              </div>
            </section>
          )}

          {map && map.detections.length === 0 && (
            <Alert title="Нет геопривязанных обнаружений">
              <span className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4" />
                Проверьте GPS и EXIF-параметры исходных снимков.
              </span>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};
