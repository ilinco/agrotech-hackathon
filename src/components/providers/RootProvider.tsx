import router from "@/routing/Routes";
import { RouterProvider } from "react-router";

export const RootProvider = () => {
  return <RouterProvider router={router} />;
};
