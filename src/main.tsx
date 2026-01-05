import { createRoot } from "react-dom/client";
import React from "react";
import { Application } from "./components/app/application.js";

createRoot(document.getElementById("app")!).render(<Application />);
