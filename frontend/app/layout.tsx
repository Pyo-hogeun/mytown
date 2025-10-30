'use client';

import GlobalStyle from '@/styles/GlobalStyle';
import { AppProviders } from './providers';
import Nav from './component/Nav';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ 카카오 주소검색 API 추가 */}
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
      </head>
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
