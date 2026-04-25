import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './i18n';
import './styles/index.css';

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: theme === 'rose'
          ? { background: '#fff5f4', color: '#2d1a1a', border: '1px solid rgba(115, 25, 27, 0.2)' }
          : theme === 'light'
          ? { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }
          : { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      }}
    />
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <App />
                <ThemedToaster />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
