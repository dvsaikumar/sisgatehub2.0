import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import AppRoutes from './routes/AppRoutes'
import "bootstrap/js/src/collapse";
import ScrollToTop from './utils/ScrollToTop';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <ScrollToTop>
          <Switch>
            <Redirect exact from="/" to="/auth/login" />
            {/* Auth */}
            <Route path="/auth" render={(props) => <AuthRoutes {...props} />} />
            {/* Layouts */}
            <Route path="/" render={(props) => <AppRoutes {...props} />} />
          </Switch>
        </ScrollToTop>
      </BrowserRouter>
    </>
  );
}

export default App;
