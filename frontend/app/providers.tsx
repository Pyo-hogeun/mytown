'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import styled, { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AppWrapper store={store}>
        {children}
      </AppWrapper>
    </ThemeProvider>
  );
}


const AppWrapper = styled(Provider)`
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100dvh;
`;