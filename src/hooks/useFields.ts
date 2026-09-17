import { useContext } from "react";
import { FieldsContext } from "@/context/FieldsContext";

export const useFields = () => {
  const context = useContext(FieldsContext);
  if (!context) throw new Error("useFields must be used within FieldsProvider");
  return context;
};
