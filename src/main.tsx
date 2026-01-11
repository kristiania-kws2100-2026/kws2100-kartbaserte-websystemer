import { createRoot } from "react-dom/client";
import React from "react";
import { Application } from "./components/app/application.js";

createRoot(document.getElementById("root")!).render(
  <Application description={"React Application"} />,
);
