import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
// Tailwind CSS - Mobile First Responsive System
import './styles/tailwind.css';
//scss
import './styles/scss/style.scss';
import './styles/scss/_responsive_overrides.scss';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ThemeProvider } from './utils/theme-provider/theme-provider.jsx';
import { IconContext } from '@phosphor-icons/react';
import { IconConfig } from './configs/IconConfig';
import { queryClient } from './lib/query-client';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <Provider store={store} >
        <IconContext.Provider value={IconConfig}>
          <App />
        </IconContext.Provider>
      </Provider>
    </ThemeProvider>
  </QueryClientProvider>
  // </React.StrictMode>,
)

