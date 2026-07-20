import { SiteHeader } from '@/widgets/site-header';
import type { Metadata } from 'next';
import { Onest } from 'next/font/google';

import './globals.css';

const onest = Onest({
  weight: ['400', '500', '600'],
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'Стрельчук в Екатеринбурге',
  description: 'Удобный навигатор по моим обзорам',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={onest.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
