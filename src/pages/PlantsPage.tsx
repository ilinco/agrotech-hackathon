import { BookOpen, MapPinned } from "lucide-react";
import { NavLink } from "react-router";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StaticLinks } from "@/config/StaticLinks";

export const PlantsPage = () => (
  <Container className="py-6 sm:py-8">
    <div>
      <h1 className="text-2xl font-medium tracking-tight">Растения</h1>
      <p className="mt-1 max-w-xl text-sm text-slate-500">
        Справочник видов сорняков и стадий вегетации, определённых моделью.
      </p>
    </div>

    <section className="mt-6 rounded-lg border border-slate-200 bg-white">
      <EmptyState
        title="Справочник пока пуст"
        description="Здесь появятся виды растений после подключения справочника и результатов анализа."
        action={
          <NavLink to={StaticLinks.map}>
            <Button variant="secondary">
              <MapPinned aria-hidden="true" className="size-4" />
              Открыть карту
            </Button>
          </NavLink>
        }
      />
    </section>

    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
      <BookOpen aria-hidden="true" className="size-4" />
      <span>Карточки растений будут связаны с обнаружениями на карте.</span>
    </div>
  </Container>
);
