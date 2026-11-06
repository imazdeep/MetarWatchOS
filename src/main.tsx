import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/outfit';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './context/SettingsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
);
