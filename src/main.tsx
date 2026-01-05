import { createRoot } from "react-dom/client";
import React from "react";
import { Application } from "./components/app/application.js";

import "./application.css";

createRoot(document.getElementById("app")!).render(<Application />);
