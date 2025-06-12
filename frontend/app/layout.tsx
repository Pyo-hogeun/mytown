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
            <nav className="p-4 bg-gray-100 flex gap-4">
              <a href="/products" className="text-blue-600">상품 목록</a>
              <a href="/products/new" className="text-green-600">상품 등록</a>
            </nav>
            
            {children}
          </AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
