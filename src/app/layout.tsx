import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { Providers } from './providers';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Стрельчук в Екатеринбурге',
  description: 'Удобный навигатор по моим обзорам',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
