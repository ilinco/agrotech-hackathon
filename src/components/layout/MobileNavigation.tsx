import { NavLink } from "react-router";
import { navigationItems } from "@/config/Navigation";

export const MobileNavigation = () => {
  return (
    <nav aria-label="Мобильная навигация" className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {navigationItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-700 ${isActive ? "text-green-800" : "text-slate-500"}`
            }
          >
            <Icon aria-hidden="true" className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
