import { NavLink } from "react-router";
import { Container } from "@/components/layout/Container";
import { navigationItems } from "@/config/Navigation";

export const Header = () => (
  <header className="border-b border-slate-200 bg-white">
    <Container>
      <div className="flex min-h-16 items-center justify-between gap-6">
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-green-800"
        >
          agrotech.
        </NavLink>
        <nav
          aria-label="Основная навигация"
          className="hidden items-center gap-1 md:flex"
        >
          {navigationItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${isActive ? "bg-green-50 text-green-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </Container>
  </header>
);
