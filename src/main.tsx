import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import './i18n';
import AppLocaleProvider from './i18n/AppLocaleProvider';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl='/login'
      signUpUrl='/register'
      afterSignOutUrl='/'
    >
      <Provider store={store}>
        <AppLocaleProvider>
          <App />
        </AppLocaleProvider>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);
