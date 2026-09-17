import { useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  MapPinned,
  ScanLine,
  Sprout,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldMap } from "./map/FieldMap";
import { demoField } from "./map/demoField";

export const HomePage = () => {
  const [selected, setSelected] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [detailView, setDetailView] = useState<"field" | "images">("field");

  const selectField = () => setSelected(true);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 lg:h-dvh">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <a
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-green-700"
        >
          <Sprout aria-hidden="true" className="size-5 text-green-800" />
          Агромониторинг
        </a>
        <span className="flex items-center gap-2 text-sm text-green-800">
          <MapPinned aria-hidden="true" className="size-4" />
          Карта полей
        </span>
      </header>

      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 px-4 py-5 sm:px-6">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
            Карта полей
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Выберите поле, чтобы перейти к снимкам и результатам анализа.
          </p>
        </div>
        <Badge className="mt-1">Демонстрационный режим</Badge>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside
          aria-label="Поля и настройки"
          className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white lg:overflow-y-auto"
        >
          <div className="border-b border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Поля</h2>
              <span className="text-xs text-slate-500">1 поле</span>
            </div>
            <button
              type="button"
              aria-pressed={selected}
              onClick={selectField}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${selected ? "border-green-700 bg-green-50" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <MapPinned
                aria-hidden="true"
                className={`size-5 shrink-0 ${selected ? "text-green-800" : "text-slate-500"}`}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {demoField.name}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Условный контур · тестовые данные
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-4 text-slate-400"
              />
            </button>
          </div>
          <div className="px-4 py-3">
            <Checkbox
              label="Показывать контур поля"
              checked={showBoundary}
              onChange={(event) => setShowBoundary(event.target.checked)}
            />
          </div>
          <p className="hidden border-t border-slate-200 p-4 text-xs leading-relaxed text-slate-500 lg:mt-auto lg:block">
            Тестовый контур нужен для знакомства с картой и не обозначает
            границы реального хозяйства.
          </p>
        </aside>

        <div className="h-[50dvh] min-h-80 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-0 [&>section]:h-full">
          <FieldMap
            field={demoField}
            selected={selected}
            showBoundary={showBoundary}
            onSelect={selectField}
          />
        </div>

        <section
          aria-label="Информация о поле"
          className="min-h-0 rounded-lg border border-slate-200 bg-white lg:col-start-1 lg:overflow-y-auto"
        >
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-2 px-4 pt-3">
                <h2 className="text-sm font-medium">{demoField.name}</h2>
                <Button
                  variant="ghost"
                  aria-label="Снять выбор поля"
                  className="px-2"
                  onClick={() => setSelected(false)}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <div
                className="flex gap-1 border-b border-slate-200 px-3 pb-2"
                aria-label="Информация и снимки"
              >
                <Button
                  size="sm"
                  variant={detailView === "field" ? "secondary" : "ghost"}
                  aria-pressed={detailView === "field"}
                  onClick={() => setDetailView("field")}
                >
                  О поле
                </Button>
                <Button
                  size="sm"
                  variant={detailView === "images" ? "secondary" : "ghost"}
                  aria-pressed={detailView === "images"}
                  onClick={() => setDetailView("images")}
                >
                  Снимки
                </Button>
              </div>
              {detailView === "field" ? (
                <div className="p-4">
                  <Badge>Тестовые данные</Badge>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Контур показан для примера. Снимки и результаты анализа пока
                    не подключены.
                  </p>
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-green-700">
                      Координаты контура · {demoField.boundary.length} точки
                    </summary>
                    <table className="mt-2 w-full text-left text-xs tabular-nums">
                      <thead className="text-slate-500">
                        <tr>
                          <th scope="col" className="py-2 font-normal">
                            №
                          </th>
                          <th scope="col" className="py-2 font-normal">
                            Широта
                          </th>
                          <th scope="col" className="py-2 font-normal">
                            Долгота
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoField.boundary.map(
                          ({ latitude, longitude }, index) => (
                            <tr
                              key={index}
                              className="border-t border-slate-100"
                            >
                              <td className="py-2">{index + 1}</td>
                              <td>{latitude}</td>
                              <td>{longitude}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </details>
                </div>
              ) : (
                <EmptyState
                  title="Снимков пока нет"
                  description="Здесь появятся снимки выбранного поля. Анализ станет доступен после подключения сервиса и добавления снимков."
                />
              )}
            </>
          ) : (
            <div className="px-4 py-6">
              <ScanLine
                aria-hidden="true"
                className="mb-3 size-5 text-slate-400"
              />
              <h2 className="text-sm font-medium">Выберите поле</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Нажмите на контур на карте или на поле в списке, чтобы открыть
                информацию.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={selectField}
              >
                Открыть тестовое поле
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
