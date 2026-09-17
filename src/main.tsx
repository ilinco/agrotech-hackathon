import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/assets/styles/main.css";
import { RootProvider } from "./components/providers/RootProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootProvider />
  </StrictMode>,
);
