import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CourseApp } from "@explorables/runtime";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
createRoot(root).render(
  <StrictMode>
    <CourseApp />
  </StrictMode>,
);
