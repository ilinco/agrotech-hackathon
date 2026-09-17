import { BookOpen, Map, ChartSpline } from "lucide-react";
import { StaticLinks } from "@/config/StaticLinks";

export const navigationItems = [
  { to: StaticLinks.map, label: "Карта", icon: Map, end: true },
  {
    to: StaticLinks.analytics,
    label: "Аналитика",
    icon: ChartSpline,
    end: false,
  },
  { to: StaticLinks.plants, label: "Растения", icon: BookOpen, end: false },
] as const;
