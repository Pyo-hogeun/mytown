'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>{children}</Provider>
    </ThemeProvider>
  );
}
