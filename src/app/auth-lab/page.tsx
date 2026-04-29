import { AuthLabPageContent } from '@/app/auth-lab/_components/auth-lab-page-content';
import { getCurrentSession } from '@/entities/session/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth lab | Стрельчук в Екатеринбурге',
};

export default async function AuthLabPage() {
  const session = await getCurrentSession();

  return <AuthLabPageContent session={session} />;
}
