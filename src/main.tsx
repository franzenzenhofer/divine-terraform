import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
  });
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => console.log('SW registered:', registration))
      .catch((error) => console.error('SW registration failed:', error));
  });
}

// Remove loading screen after React mounts
const removeLoadingScreen = (): void => {
  const loadingScreen = document.getElementById('loading');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

// Create React root and render app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Update loading progress (will be called by asset loader)
(window as any).updateLoadingProgress = (progress: number): void => {
  const progressBar = document.getElementById('loadingProgress');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
};