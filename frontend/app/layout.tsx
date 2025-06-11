'use client';

import StyledComponentsRegistry from '@/lib/registry';
import GlobalStyle from '@/styles/GlobalStyle';
import { AppProviders } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <AppProviders>
            <GlobalStyle />
            {children}
          </AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
