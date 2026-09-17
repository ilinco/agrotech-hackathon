import router from "@/routing/Routes";
import { RouterProvider } from "react-router";
import { FieldsProvider } from "./FieldsProvider";
import { NotificationsProvider } from "./NotificationsProvider";

export const RootProvider = () => {
  return (
    <NotificationsProvider>
      <FieldsProvider>
        <RouterProvider router={router} />
      </FieldsProvider>
    </NotificationsProvider>
  );
};
