import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Landing_page from "./pages/Landing_page.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Landing_page />
  </StrictMode>
);
