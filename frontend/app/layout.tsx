'use client';

import GlobalStyle from '@/styles/GlobalStyle';
import { AppProviders } from './providers';
import Nav from './component/Nav';
import Script from 'next/script';
import styled from 'styled-components';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* ✅ 카카오 주소검색 API 추가 */}
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <AppProviders>
          <AppWrapper>
            <GlobalStyle />
            <Nav />

            {children}
          </AppWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
const AppWrapper = styled.div`
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  // min-height: 100dvh;
`