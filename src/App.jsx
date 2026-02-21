import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import AppRoutes from './routes/AppRoutes'
import "bootstrap/js/src/collapse";
import ScrollToTop from './utils/ScrollToTop';
import { Toaster } from 'react-hot-toast';

import CommandPalette from './components/CommandPalette/CommandPalette.tsx';
import { RouteTracker } from './views/AuditLogs/RouteTracker';

const ExploreFeatures = React.lazy(() => import('./views/ExploreFeatures'));

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
        containerStyle={{
          zIndex: 9999,
        }}
        gutter={8}
      />
      <BrowserRouter>
        <RouteTracker />
        <CommandPalette />
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/logout" element={<Navigate to="/auth/login" replace />} />
            {/* Public — Explore Features (accessible from Login) */}
            <Route path="/explore-features" element={
              <Suspense fallback={<div className="preloader-it"><div className="loader-pendulums" /></div>}>
                <ExploreFeatures />
              </Suspense>
            } />
            {/* Auth */}
            <Route path="auth/*" element={<AuthRoutes />} />
            {/* Layouts */}
            <Route path="*" element={<AppRoutes />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </>
  );
}

export default App;
