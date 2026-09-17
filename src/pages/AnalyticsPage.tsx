import { NavLink, useParams } from "react-router";
import { ChartSpline, MapPinned } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFields } from "@/hooks/useFields";
import { StaticLinks } from "@/config/StaticLinks";

export const AnalyticsPage = () => {
  const { fields, activeField } = useFields();
  const { fieldId } = useParams<{ fieldId: string }>();
  const field = fieldId
    ? fields.find((item) => item.id === fieldId)
    : activeField;

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Аналитика</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Результаты анализа снимков, обнаруженные растения и история по
            полям.
          </p>
        </div>
        <Badge>{fields.length ? `Полей: ${fields.length}` : "Нет полей"}</Badge>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        {field ? (
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ChartSpline
                aria-hidden="true"
                className="mt-0.5 size-5 text-green-800"
              />
              <div>
                <h2 className="font-medium">{field.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Для этого поля ещё не запускался анализ снимков.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <Button disabled>Запустить анализ</Button>
              <p className="mt-2 text-xs text-slate-500">
                Действие станет доступно после подключения снимков и сервиса
                анализа.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            title={fieldId ? "Поле не найдено" : "Нет данных для анализа"}
            description={
              fieldId
                ? "Проверьте ссылку или выберите поле на карте."
                : "Сначала добавьте поле на карте, затем загрузите снимки для анализа."
            }
            action={
              <NavLink to={StaticLinks.map}>
                <Button>
                  <MapPinned aria-hidden="true" className="size-4" />
                  Открыть карту
                </Button>
              </NavLink>
            }
          />
        )}
      </section>
    </Container>
  );
};
