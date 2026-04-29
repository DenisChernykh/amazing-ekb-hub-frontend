import { notFound } from 'next/navigation';

/**
 * Ограничивает auth lab только локальным dev runtime.
 *
 * @remarks
 * Стенд раскрывает внутреннюю session/permission модель, поэтому в production
 * route должен вести себя как отсутствующий.
 */
export default function AuthLabLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return children;
}
