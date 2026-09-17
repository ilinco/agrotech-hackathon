import App from "@/App";
import { StaticLinks } from "@/config/StaticLinks";
import { HomePage } from "@/pages/HomePage";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: StaticLinks.home,
    Component: App,
    children: [{ index: true, Component: HomePage }],
  },
]);

export default router;
