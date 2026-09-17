import { ChartSpline, ScanLine, X } from "lucide-react";
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
      <div className="px-4 py-6">
        <ScanLine aria-hidden="true" className="mb-3 size-5 text-slate-400" />
        <h2 className="text-sm font-medium">
          {fieldsCount ? "Выберите поле" : "Полей пока нет"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {fieldsCount
            ? "Нажмите на контур на карте или на поле в списке, чтобы открыть информацию."
            : "Добавьте поле и отметьте точки его контура на карте."}
        </p>
        {!fieldsCount && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={onStartDrawing}
          >
            Добавить поле
          </Button>
        )}
      </div>
    )}
  </section>
);
