'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';
/**
 * Подключает Chakra UI и провайдер цветовой схемы для всего приложения.
 *
 * @param props - Пропсы `next-themes`, пробрасываемые в `ColorModeProvider`.
 */
export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
