import React from 'react';
import ReactDOM from 'react-dom/client';
import RoutesPage from './Routes';
import Header from '@components/header';
import Sidebar from '@components/Sidebar';
import StoreProvider from './StoreProvider';
import * as Sentry from "@sentry/react";

// Global Styles
import '@styles/globals.css';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

// Sentry
Sentry.init({
  dsn: "https://6052f12d10cce6e495591686a60650db@o4508604173975552.ingest.de.sentry.io/4508604178694224",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, 
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider>
      <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-white">
        <Header />
        <Sidebar />
        <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
          <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
            <RoutesPage />
          </div>
        </div>
      </div>
    </StoreProvider>
  </React.StrictMode>
);
