'use client';

import { LinkProps } from '@mui/material';
import Link from 'next/link';
/**
 * Client-side обертка над `next/link`, которую можно безопасно
 * передавать в `component` prop MUI-компонентов из server components.
 *
 * @param props - Пропсы Next Link и стандартного anchor-элемента.
 * @returns Client Component-обертку над `next/link`.
 */
export type AppLinkProps = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;
export default Link;
