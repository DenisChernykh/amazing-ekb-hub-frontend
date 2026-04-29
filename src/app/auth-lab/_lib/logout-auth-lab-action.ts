'use server';

import { logoutCurrentSession } from '@/entities/session/server';
import { redirect } from 'next/navigation';

/**
 * Выполняет тестовый logout из auth lab и возвращает пользователя на стенд.
 */
export async function logoutAuthLabAction(): Promise<void> {
  await logoutCurrentSession();
  redirect('/auth-lab');
}
