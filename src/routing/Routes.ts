import App from "@/App";
import { StaticLinks } from "@/config/StaticLinks";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { HomePage } from "@/pages/HomePage";
import { PlantsPage } from "@/pages/PlantsPage";
import { createBrowserRouter, redirect } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, loader: () => redirect(StaticLinks.map) },
      { path: StaticLinks.map, Component: HomePage },
      { path: StaticLinks.analytics, Component: AnalyticsPage },
      {
        path: `${StaticLinks.analytics}/:fieldId`,
        Component: AnalyticsPage,
      },
      { path: StaticLinks.plants, Component: PlantsPage },
    ],
  },
]);

export default router;
