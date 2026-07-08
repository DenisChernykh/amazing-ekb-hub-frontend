import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Это хелпер. Склеивает conditional className и разрешает Tailwind-конфликты.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
