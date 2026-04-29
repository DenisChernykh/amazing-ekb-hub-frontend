import { SessionProvider } from '@/entities/session';
import { getCurrentSession } from '@/entities/session/server';

/**
 * Создаёт stable key для session boundary.
 *
 * @param session - Текущая server-side session model.
 * @returns Ключ, меняющийся при смене пользователя или anonymous/authenticated статуса.
 */
function getSessionBoundaryKey(session: Awaited<ReturnType<typeof getCurrentSession>>): string {
  if (session.status === 'anonymous') {
    return 'anonymous';
  }

  return `${session.user.id}:${session.user.role}`;
}

export default async function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialSession = await getCurrentSession();

  return (
    <SessionProvider key={getSessionBoundaryKey(initialSession)} initialSession={initialSession}>
      {children}
    </SessionProvider>
  );
}
