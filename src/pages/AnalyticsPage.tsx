import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BarChart3, Download, Play, RefreshCw } from 'lucide-react';
import {
  createAnalysisRun,
  downloadAggregateReport,
  downloadAnnotatedPhoto,
  downloadRunExport,
  downloadRunReport,
  getAggregateReport,
  getAnalysisMap,
  getAnalysisRun,
} from '@/api/analysis';
import { getApiErrorMessage } from '@/api/errors';
import { getField } from '@/api/fields';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Select } from '@/components/ui/Select';
import { Container } from '@/components/layout/Container';
import { analysisStatusLabels } from '@/config/analysisLabels';
import { DynamicLinks } from '@/config/DynamicLinks';
import { useFields } from '@/hooks/useFields';
import { useNotifications } from '@/hooks/useNotifications';
import { AnalysisResult } from '@/pages/analytics/AnalysisResult';
import type {
  AggregateReport,
  AnalysisMap,
  AnalysisRun,
} from '@/types/analysis';
import type { FieldPhoto } from '@/types/field';

const activeStatuses = new Set<AnalysisRun['status']>(['PENDING', 'RUNNING']);

export const AnalyticsPage = () => {
  const { fields, activeField, loading: fieldsLoading } = useFields();
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const selectedFieldId = fieldId ?? activeField?.id ?? fields[0]?.id;
  const field = fields.find((item) => item.id === selectedFieldId);
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
  const [aggregate, setAggregate] = useState<AggregateReport>();
  const [run, setRun] = useState<AnalysisRun>();
  const [analysisMap, setAnalysisMap] = useState<AnalysisMap>();
  const [selectedDetectionId, setSelectedDetectionId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [loadedFieldId, setLoadedFieldId] = useState<string>();
  const [working, setWorking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!selectedFieldId) return;
    let cancelled = false;
    Promise.all([
      getField(selectedFieldId),
      getAggregateReport(selectedFieldId),
    ])
      .then(([details, report]) => {
        if (cancelled) return;
        setPhotos(details.photos);
        setAggregate(report);
        setLoading(false);
        setLoadedFieldId(selectedFieldId);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        setLoadedFieldId(selectedFieldId);
        notifications.error(
          'Не удалось загрузить аналитику',
          getApiErrorMessage(error),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [notifications, selectedFieldId]);

  useEffect(() => {
    if (!run || !activeStatuses.has(run.status)) return;
    const timeout = window.setTimeout(() => {
      getAnalysisRun(run.id)
        .then(setRun)
        .catch((error: unknown) =>
          notifications.error(
            'Не удалось обновить статус анализа',
            getApiErrorMessage(error),
          ),
        );
    }, 2_000);
    return () => window.clearTimeout(timeout);
  }, [notifications, run]);

  useEffect(() => {
    if (!run || run.status !== 'DONE' || !selectedFieldId) return;
    let cancelled = false;
    Promise.all([
      getAnalysisMap(run.id),
      getAggregateReport(selectedFieldId, from, to),
    ])
      .then(([map, report]) => {
        if (cancelled) return;
        setAnalysisMap(map);
        setAggregate(report);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          notifications.warning(
            'Анализ готов, но часть данных не загрузилась',
            getApiErrorMessage(error),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, notifications, run, selectedFieldId, to]);

  const photoIds = useMemo(() => photos.map(({ id }) => id), [photos]);
  const allPhotosSelected =
    photoIds.length > 0 &&
    photoIds.every((id) => selectedPhotoIds.includes(id));

  const openRun = async (runId: number) => {
    setWorking(true);
    setSelectedDetectionId(undefined);
    setAnalysisMap(undefined);
    try {
      const details = await getAnalysisRun(runId);
      setRun(details);
      if (details.status === 'DONE')
        setAnalysisMap(await getAnalysisMap(runId));
    } catch (error) {
      notifications.error(
        'Не удалось открыть анализ',
        getApiErrorMessage(error),
      );
    } finally {
      setWorking(false);
    }
  };

  const startAnalysis = async () => {
    if (!selectedPhotoIds.length) return;
    setWorking(true);
    setAnalysisMap(undefined);
    setSelectedDetectionId(undefined);
    try {
      const created = await createAnalysisRun(selectedPhotoIds);
      const details = await getAnalysisRun(created.id);
      setRun(details);
      notifications.success(
        'Анализ запущен',
        `В обработку отправлено снимков: ${selectedPhotoIds.length}.`,
      );
    } catch (error) {
      notifications.error(
        'Не удалось запустить анализ',
        getApiErrorMessage(error),
      );
    } finally {
      setWorking(false);
    }
  };

  const loadAggregate = async () => {
    if (!selectedFieldId) return;
    setWorking(true);
    try {
      setAggregate(await getAggregateReport(selectedFieldId, from, to));
      notifications.success('Отчёт обновлён');
    } catch (error) {
      notifications.error(
        'Не удалось обновить отчёт',
        getApiErrorMessage(error),
      );
    } finally {
      setWorking(false);
    }
  };

  const performDownload = async (action: () => Promise<void>) => {
    setDownloading(true);
    try {
      await action();
      notifications.success('Файл подготовлен', 'Загрузка началась.');
    } catch (error) {
      notifications.error('Не удалось скачать файл', getApiErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  if (
    fieldsLoading ||
    (selectedFieldId && (loading || loadedFieldId !== selectedFieldId))
  ) {
    return (
      <Container className="py-10">
        <Loader label="Загружаем аналитику…" />
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Аналитика</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Запуск анализа снимков, обнаружения и рекомендации по выбранному
            полю.
          </p>
        </div>
        <Badge>{fields.length ? `Полей: ${fields.length}` : 'Нет полей'}</Badge>
      </div>

      {!field ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white">
          <EmptyState
            title={fieldId ? 'Поле не найдено' : 'Нет данных для анализа'}
            description="Сначала создайте поле на карте и привяжите к нему снимки."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <Select
                label="Поле"
                value={field.id}
                onChange={(event) => {
                  setRun(undefined);
                  setAnalysisMap(undefined);
                  setSelectedPhotoIds([]);
                  navigate(DynamicLinks.analytics(event.target.value));
                }}
              >
                {fields.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>

              <div className="mt-5 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Снимки для анализа</h2>
                <span className="text-xs text-slate-500">
                  {selectedPhotoIds.length}/{photos.length}
                </span>
              </div>
              {photos.length ? (
                <>
                  <div className="mt-3 border-b border-slate-100 pb-3">
                    <Checkbox
                      label="Выбрать все"
                      checked={allPhotosSelected}
                      onChange={(event) =>
                        setSelectedPhotoIds(
                          event.target.checked ? photoIds : [],
                        )
                      }
                    />
                  </div>
                  <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                    {photos.map((photo) => (
                      <li key={photo.id}>
                        <Checkbox
                          label={photo.originalName}
                          checked={selectedPhotoIds.includes(photo.id)}
                          onChange={(event) =>
                            setSelectedPhotoIds((current) =>
                              event.target.checked
                                ? [...current, photo.id]
                                : current.filter((id) => id !== photo.id),
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    disabled={!selectedPhotoIds.length}
                    loading={working}
                    onClick={() => void startAnalysis()}
                  >
                    <Play aria-hidden="true" className="size-4" />
                    Запустить анализ
                  </Button>
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  У поля нет привязанных снимков. Добавьте их на странице карты.
                </p>
              )}
            </section>

            {aggregate && (
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium">Сводка периода</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Запусков</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {aggregate.runsCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Объектов</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {aggregate.detectionsCount}
                    </dd>
                  </div>
                </dl>
                {Object.keys(aggregate.bySpecies).length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-500">
                      По видам
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {Object.entries(aggregate.bySpecies).map(
                        ([speciesName, count]) => (
                          <li
                            key={speciesName}
                            className="flex justify-between gap-3"
                          >
                            <span className="min-w-0 truncate">
                              {speciesName}
                            </span>
                            <span className="font-medium tabular-nums">
                              {count}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-medium">Период отчёта</h2>
              <div className="mt-3 space-y-3">
                <Input
                  label="С"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
                <Input
                  label="По"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={working}
                    onClick={() => void loadAggregate()}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    Обновить
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={downloading}
                    onClick={() =>
                      void performDownload(() =>
                        downloadAggregateReport(field.id, from, to),
                      )
                    }
                  >
                    <Download aria-hidden="true" className="size-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <BarChart3
                  aria-hidden="true"
                  className="size-4 text-green-800"
                />
                <h2 className="text-sm font-medium">История запусков</h2>
              </div>
              {aggregate?.perRun.length ? (
                <ul className="mt-3 space-y-2">
                  {aggregate.perRun.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void openRun(item.id)}
                        className={`w-full rounded-lg border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-green-700 ${run?.id === item.id ? 'border-green-700 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">Анализ №{item.id}</span>
                          <Badge
                            tone={
                              item.status === 'DONE'
                                ? 'success'
                                : item.status === 'FAILED'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {analysisStatusLabels[item.status]}
                          </Badge>
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('ru-RU')}{' '}
                          · объектов: {item.detectionsCount}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Запусков за выбранный период нет.
                </p>
              )}
            </section>
          </aside>

          <main className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
            {run ? (
              <AnalysisResult
                field={field}
                run={run}
                map={analysisMap}
                selectedDetectionId={selectedDetectionId}
                downloading={downloading}
                onSelectDetection={setSelectedDetectionId}
                onDownload={(kind) =>
                  void performDownload(() =>
                    kind === 'pdf'
                      ? downloadRunReport(run.id)
                      : downloadRunExport(run.id, kind),
                  )
                }
                onDownloadAnnotated={(photoId) =>
                  void performDownload(() =>
                    downloadAnnotatedPhoto(run.id, photoId),
                  )
                }
              />
            ) : (
              <EmptyState
                title="Выберите или запустите анализ"
                description="Результаты, карта обнаружений и рекомендации появятся в этой области."
              />
            )}
          </main>
        </div>
      )}
    </Container>
  );
};
