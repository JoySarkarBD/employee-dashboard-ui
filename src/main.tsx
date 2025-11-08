import { App as AntApp } from "antd";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AntApp>
      <App />
    </AntApp>
  </StrictMode>
);
