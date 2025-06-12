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
              <ul>
                <li><a href="/products" className="text-blue-600">상품 목록</a></li>
                <li><a href="/products/new" className="text-green-600">상품 등록</a></li>
                <li><a href="/login" className="text-green-600">로그인</a></li>
                <li><a href="/register" className="text-green-600">회원가입</a></li>
              </ul>
            </nav>
            
            {children}
          </AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
