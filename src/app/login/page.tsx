import { getCurrentSession } from '@/entities/session/server';
import { normalizeLoginRedirect } from '@/features/auth-login';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginPageContent } from './_components/login-page-content';

type RawSearchParams = Record<string, string | string[] | undefined>;

interface LoginPageProps {
  searchParams?: Promise<RawSearchParams>;
}

export const metadata: Metadata = {
  title: 'Вход | Стрельчук в Екатеринбурге',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const redirectTo = normalizeLoginRedirect(resolvedSearchParams.redirectTo);
  const session = await getCurrentSession();

  if (session.status === 'authenticated') {
    redirect(redirectTo);
  }

  return <LoginPageContent redirectTo={redirectTo} />;
}
