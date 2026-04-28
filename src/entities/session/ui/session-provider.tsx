'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  createAnonymousSession,
  createAuthenticatedSession,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from '../model/session-guards';
import type { AuthPermission, SessionRole, SessionState, SessionUser } from '../model/types';

interface SessionProviderProps {
  initialSession: SessionState;
  children: React.ReactNode;
}

interface SessionContextValue {
  session: SessionState;
  user: SessionUser | null;
  isAuthenticated: boolean;
  setSessionUser: (user: SessionUser) => void;
  clearSession: () => void;
  hasRole: (role: SessionRole) => boolean;
  hasAnyRole: (roles: readonly SessionRole[]) => boolean;
  hasPermission: (permission: AuthPermission) => boolean;
  hasAnyPermission: (permissions: readonly AuthPermission[]) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Хранит безопасную session model в клиентском React-дереве.
 *
 * @remarks
 * Provider не хранит access/refresh tokens. Он предназначен только для UI-gating
 * и мгновенного обновления интерфейса после server action.
 */
export function SessionProvider({ initialSession, children }: Readonly<SessionProviderProps>) {
  const [session, setSession] = useState<SessionState>(initialSession);

  const setSessionUser = useCallback((user: SessionUser) => {
    setSession(createAuthenticatedSession(user));
  }, []);

  const clearSession = useCallback(() => {
    setSession(createAnonymousSession());
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      user: session.user,
      isAuthenticated: session.status === 'authenticated',
      setSessionUser,
      clearSession,
      hasRole: (role) => hasRole(session, role),
      hasAnyRole: (roles) => hasAnyRole(session, roles),
      hasPermission: (permission) => hasPermission(session, permission),
      hasAnyPermission: (permissions) => hasAnyPermission(session, permissions),
    }),
    [clearSession, session, setSessionUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Возвращает безопасное клиентское состояние текущей сессии.
 *
 * @returns Session context для UI-gating.
 * @throws Error Если hook используется вне `SessionProvider`.
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider.');
  }

  return context;
}
