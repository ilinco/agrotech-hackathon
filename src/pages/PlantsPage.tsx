import { useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw, Search } from 'lucide-react';
import { getApiErrorMessage } from '@/api/errors';
import { getSpecies, syncSpecies } from '@/api/species';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Container } from '@/components/layout/Container';
import { lifecycleLabels, taxonClassLabels } from '@/config/analysisLabels';
import { useNotifications } from '@/hooks/useNotifications';
import type { WeedSpecies } from '@/types/analysis';

export const PlantsPage = () => {
  const notifications = useNotifications();
  const [species, setSpecies] = useState<WeedSpecies[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSpecies()
      .then((items) => {
        if (!cancelled) setSpecies(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          notifications.error(
            'Не удалось загрузить справочник',
            getApiErrorMessage(error),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notifications]);

  const filteredSpecies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
    if (!normalizedQuery) return species;
    return species.filter((item) =>
      [item.name, item.latinName]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase('ru-RU').includes(normalizedQuery),
        ),
    );
  }, [query, species]);

  const synchronize = async () => {
    setSyncing(true);
    try {
      const result = await syncSpecies();
      setSpecies(result.species);
      notifications.success(
        'Справочник синхронизирован',
        `Обработано видов: ${result.synced}.`,
      );
    } catch (error) {
      notifications.error(
        'Не удалось синхронизировать справочник',
        getApiErrorMessage(error),
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Растения</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Справочник видов сорняков и их агрономической классификации.
          </p>
        </div>
        <Button
          variant="secondary"
          loading={syncing}
          onClick={() => void synchronize()}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Синхронизировать
        </Button>
      </div>

      {loading ? (
        <div className="mt-8">
          <Loader label="Загружаем справочник…" />
        </div>
      ) : species.length ? (
        <>
          <div className="mt-6 max-w-md">
            <Input
              label="Поиск по названию"
              value={query}
              placeholder="Например, бодяк"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSpecies.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-800">
                    <BookOpen aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium">{item.name}</h2>
                    <p className="mt-0.5 text-sm italic text-slate-500">
                      {item.latinName ?? 'Научное название не указано'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>
                    {item.taxonClass
                      ? taxonClassLabels[item.taxonClass]
                      : 'Класс не определён'}
                  </Badge>
                  <Badge
                    tone={
                      item.lifecycle === 'PERENNIAL' ? 'warning' : 'neutral'
                    }
                  >
                    {item.lifecycle
                      ? lifecycleLabels[item.lifecycle]
                      : 'Цикл не определён'}
                  </Badge>
                </div>
              </article>
            ))}
          </div>
          {!filteredSpecies.length && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-white">
              <EmptyState
                title="Ничего не найдено"
                description="Измените поисковый запрос."
              />
            </div>
          )}
        </>
      ) : (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white">
          <EmptyState
            title="Справочник пока пуст"
            description="Запустите синхронизацию, чтобы backend просканировал каталог эталонных видов."
          />
        </section>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Search aria-hidden="true" className="size-4" />
        <span>В справочнике: {species.length} видов.</span>
      </div>
    </Container>
  );
};
