import { Container } from "@/components/layout/Container";

type UpcomingPageProps = { title: string; description: string };

export const UpcomingPage = ({ title, description }: UpcomingPageProps) => (
  <Container>
    <section className="py-12">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="mt-3 max-w-xl text-slate-600">{description}</p>
    </section>
  </Container>
);
