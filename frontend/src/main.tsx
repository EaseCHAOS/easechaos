import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

const APP_VERSION = "1.0.0";

const checkVersion = () => {
  const lastVersion = localStorage.getItem("app_version");
  if (lastVersion !== APP_VERSION) {
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("schedule:")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem("app_version", APP_VERSION);
    window.location.reload();
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      registration.update();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              if (confirm("New version available! Click OK to update.")) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}

checkVersion();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
