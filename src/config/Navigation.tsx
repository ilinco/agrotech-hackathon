import { BookOpen, House, Map, Route } from "lucide-react";
import { StaticLinks } from "@/config/StaticLinks";

export const navigationItems = [
  { to: StaticLinks.home, label: "Обзор", icon: House, end: true },
  { to: StaticLinks.fields, label: "Поля", icon: Map, end: false },
  { to: StaticLinks.routes, label: "Маршруты", icon: Route, end: false },
  { to: StaticLinks.plants, label: "Растения", icon: BookOpen, end: false },
] as const;
