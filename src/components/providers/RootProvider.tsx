import router from "@/routing/Routes";
import { RouterProvider } from "react-router";
import { FieldsProvider } from "./FieldsProvider";

export const RootProvider = () => {
  return (
    <FieldsProvider>
      <RouterProvider router={router} />
    </FieldsProvider>
  );
};
