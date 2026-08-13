import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { registerSW } from "virtual:pwa-register";

if (typeof Array.prototype.toSorted !== "function") {
  // oxlint-disable-next-line no-extend-native -- runtime polyfill for legacy browsers
  Array.prototype.toSorted = function <T>(
    this: T[],
    compareFn?: (a: T, b: T) => number,
  ): T[] {
    // oxlint-disable-next-line no-array-sort -- implementing toSorted via sort
    return [...this].sort(compareFn);
  };
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
