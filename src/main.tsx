import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { securityShield } from './utils/securityShield';
import { applyManifestToDOM } from './utils/manifestManager';

// Initialize Enterprise Anti-Inspection & DevTools Protection Shield
securityShield.init();

// Apply Super Admin PWA Web Manifest configurations
applyManifestToDOM();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
