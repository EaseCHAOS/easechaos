import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext'

// Add version checking
const APP_VERSION = '1.0.0'; // Increment this when making significant changes

const checkVersion = () => {
  const lastVersion = localStorage.getItem('app_version');
  if (lastVersion !== APP_VERSION) {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Clear relevant localStorage items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('schedule:')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('app_version', APP_VERSION);
    // Reload the page to ensure fresh content
    window.location.reload();
  }
};

// Register service worker with immediate update check
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Check for updates immediately
      registration.update();

      // Listen for new service worker installation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, trigger reload
              if (confirm('New version available! Click OK to update.')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}

// Run version check on startup
checkVersion();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
