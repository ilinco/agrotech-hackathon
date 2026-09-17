import { Outlet } from "react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNavigation />
    </div>
  );
}

export default App;
