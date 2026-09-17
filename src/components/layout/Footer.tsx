import { Container } from "@/components/layout/Container";

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-slate-50">
    <Container>
      <div className="flex min-h-16 flex-col justify-center gap-1 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-slate-700">agrotech</span>
        <span>Мониторинг полей и данных съёмки</span>
      </div>
    </Container>
  </footer>
);
