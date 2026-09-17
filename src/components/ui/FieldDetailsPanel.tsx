import {
  ArrowRight,
  ChartSpline,
  Map,
  MousePointer2,
  ScanLine,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicLinks } from "@/config/DynamicLinks";
import type { Field } from "@/types/field";

type FieldDetailsPanelProps = {
  fieldsCount: number;
  field?: Field;
  detailView: "field" | "images";
  onDetailViewChange: (view: "field" | "images") => void;
  onClearField: () => void;
  onStartDrawing: () => void;
};

export const FieldDetailsPanel = ({
  fieldsCount,
  field,
  detailView,
  onDetailViewChange,
  onClearField,
  onStartDrawing,
}: FieldDetailsPanelProps) => (
  <section
    aria-label="Информация о поле"
    className="min-h-0 rounded-lg border border-slate-200 bg-white lg:col-start-1 lg:overflow-y-auto"
  >
    {field ? (
      <>
        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          <h2 className="text-sm font-medium">{field.name}</h2>
          <Button
            variant="ghost"
            aria-label="Снять выбор поля"
            className="px-2"
            onClick={onClearField}
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
            onClick={() => onDetailViewChange("field")}
          >
            О поле
          </Button>
          <Button
            size="sm"
            variant={detailView === "images" ? "secondary" : "ghost"}
            aria-pressed={detailView === "images"}
            onClick={() => onDetailViewChange("images")}
          >
            Снимки
          </Button>
        </div>
        {detailView === "field" ? (
          <div className="p-4">
            <NavLink
              to={DynamicLinks.analytics(field.id)}
              className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-green-800 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <ChartSpline aria-hidden="true" className="size-4" />
              Открыть аналитику
            </NavLink>
            <details className="mt-4 text-sm" open>
              <summary className="cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-green-700">
                Координаты контура · {field.boundary.length} точки
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
                  {field.boundary.map(({ latitude, longitude }, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="py-2">{index + 1}</td>
                      <td>{latitude}</td>
                      <td>{longitude}</td>
                    </tr>
                  ))}
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
      <div className="px-4 py-5">
        <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-green-100 bg-green-50 text-green-800">
          {fieldsCount ? (
            <MousePointer2 aria-hidden="true" className="size-5" />
          ) : (
            <ScanLine aria-hidden="true" className="size-5" />
          )}
        </div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-800">
          {fieldsCount ? "Просмотр поля" : "Начало работы"}
        </p>
        <h2 className="text-base font-semibold text-slate-900">
          {fieldsCount ? "Выберите поле" : "Полей пока нет"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {fieldsCount
            ? "Нажмите на контур на карте или на поле в списке, чтобы открыть информацию."
            : "Создайте первое поле, чтобы работать с его контуром, снимками и результатами анализа."}
        </p>
        {!fieldsCount && (
          <>
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-green-800 shadow-sm">
                1
              </span>
              <span className="self-center">Отметьте контур на карте</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-green-800 shadow-sm">
                2
              </span>
              <span className="self-center">
                Сохраните поле и добавьте снимки
              </span>
            </div>
            <Button className="mt-4 w-full" onClick={onStartDrawing}>
              <Map aria-hidden="true" className="size-4" />
              Добавить первое поле
              <ArrowRight aria-hidden="true" className="ml-auto size-4" />
            </Button>
          </>
        )}
      </div>
    )}
  </section>
);
