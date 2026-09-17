import App from "@/App";
import { createElement } from "react";
import { StaticLinks } from "@/config/StaticLinks";
import { HomePage } from "@/pages/HomePage";
import { UpcomingPage } from "@/pages/UpcomingPage";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: StaticLinks.home,
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: StaticLinks.fields, Component: () => createElement(UpcomingPage, { title: "Поля", description: "Здесь появятся карта полей, контуры и снимки." }) },
      { path: StaticLinks.routes, Component: () => createElement(UpcomingPage, { title: "Маршруты", description: "Здесь появятся маршруты облёта и точки маршрута." }) },
      { path: StaticLinks.plants, Component: () => createElement(UpcomingPage, { title: "Растения", description: "Здесь появится справочник видов сорняков и стадий вегетации." }) },
    ],
  },
]);

export default router;
