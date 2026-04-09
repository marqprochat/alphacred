import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { trackError, trackEvent } from './telemetry.ts';
import './index.css';

function FatalScreen() {
  return (
    <div className="min-h-screen bg-background px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-400/30 bg-red-500/10 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-200">Falha na tela</p>
        <h1 className="mt-4 text-3xl font-serif font-bold">Ocorreu um erro inesperado ao carregar o formulario.</h1>
        <p className="mt-4 text-sm text-red-100/90">
          Recarregue a pagina e tente novamente. Se o problema continuar, a equipe precisa revisar esse fluxo.
        </p>
      </div>
    </div>
  );
}

function AppShell() {
  const [hasFatalError, setHasFatalError] = useState(false);

  useEffect(() => {
    const handleError = (event: Event) => {
      if ('reason' in event) {
        trackError('app_unhandled_rejection', (event as PromiseRejectionEvent).reason);
      } else {
        const errorEvent = event as ErrorEvent;
        trackError('app_fatal_error', errorEvent.error ?? errorEvent.message, {
          source: errorEvent.filename,
          line: errorEvent.lineno,
          column: errorEvent.colno,
        });
      }

      setHasFatalError(true);
    };

    trackEvent('app_shell_mounted');

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasFatalError) {
    return <FatalScreen />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
