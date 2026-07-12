import { Literata, Manrope } from 'next/font/google';

const literata = Literata({
  display: 'swap',
  subsets: ['cyrillic', 'latin'],
  variable: '--font-place-display',
  weight: ['500', '600'],
});

const manrope = Manrope({
  display: 'swap',
  subsets: ['cyrillic', 'latin'],
  variable: '--font-place-ui',
});

/**
 * Ограничивает новую типографику страницей места, не меняя legacy-разделы.
 */
export const placeDetailFontVariables = `${literata.variable} ${manrope.variable}`;
