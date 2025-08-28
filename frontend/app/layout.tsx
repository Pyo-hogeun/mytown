'use client';

import GlobalStyle from '@/styles/GlobalStyle';
import { AppProviders } from './providers';
import Nav from './component/Nav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <GlobalStyle />
          <Nav />
          
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
