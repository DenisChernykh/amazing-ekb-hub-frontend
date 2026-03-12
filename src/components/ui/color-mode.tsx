'use client';

import type { IconButtonProps, SpanProps } from '@chakra-ui/react';
import { ClientOnly, IconButton, Skeleton, Span } from '@chakra-ui/react';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider, useTheme } from 'next-themes';
import * as React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

/**
 * Пропсы провайдера цветовой схемы на базе `next-themes`.
 */
export type ColorModeProviderProps = ThemeProviderProps;
/**
 * Подключает `next-themes` для управления цветовой схемой приложения.
 *
 * @param props - Конфигурация `ThemeProvider`.
 */
export function ColorModeProvider(props: ColorModeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}
/**
 * Допустимые цветовые режимы интерфейса.
 */
export type ColorMode = 'light' | 'dark';
/**
 * Контракт хука `useColorMode`.
 */
export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}
/**
 * Возвращает текущий цветовой режим и действия для его изменения.
 *
 * @returns Текущий режим, setter и функцию переключения темы.
 */
export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = forcedTheme || resolvedTheme;
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  };
}
/**
 * Возвращает значение, соответствующее текущей цветовой теме.
 *
 * @typeParam T - Тип значения для светлой и тёмной тем.
 * @param light - Значение для светлой темы.
 * @param dark - Значение для тёмной темы.
 * @returns Значение для активной темы.
 */
export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}
/**
 * Рендерит иконку текущего цветового режима.
 */
export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />;
}

type ColorModeButtonProps = Omit<IconButtonProps, 'aria-label'>;
/**
 * Рендерит кнопку переключения между светлой и тёмной темой.
 *
 * @remarks Пробрасывает `ref` к нативной кнопке Chakra `IconButton`.
 */
export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    return (
      <ClientOnly fallback={<Skeleton boxSize="9" />}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          ref={ref}
          {...props}
          css={{
            _icon: {
              width: '5',
              height: '5',
            },
          }}
        >
          <ColorModeIcon />
        </IconButton>
      </ClientOnly>
    );
  },
);
/**
 * Принудительно рендерит потомков в контексте светлой темы Chakra UI.
 */
export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  },
);
/**
 * Принудительно рендерит потомков в контексте тёмной темы Chakra UI.
 */
export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(function DarkMode(props, ref) {
  return (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      colorScheme="dark"
      ref={ref}
      {...props}
    />
  );
});
