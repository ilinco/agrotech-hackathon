import { Container } from "@/components/layout/Container";
import { mockAgroData } from "@/mocks/agroData";

export const HomePage = () => {
  const field = mockAgroData.fields[0];
  const analysis = mockAgroData.analyses[0];

  return (
    <Container>
      <section className="py-12">
        <p className="mb-2 text-sm font-medium text-amber-700">Демонстрационные данные</p>
        <h1 className="text-2xl font-medium">{field.name}</h1>
        <p className="mt-2 text-slate-600">{field.cropName}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Снимков</dt>
            <dd className="mt-1 text-xl font-medium">{mockAgroData.images.length}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Обнаружений</dt>
            <dd className="mt-1 text-xl font-medium">{analysis.detectionIds.length}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Точек маршрута</dt>
            <dd className="mt-1 text-xl font-medium">{mockAgroData.routes[0].waypoints.length}</dd>
          </div>
        </dl>
      </section>
    </Container>
  );
};
