'use client';

import { App as AntdApp, ConfigProvider, theme, type ThemeConfig } from 'antd';

interface ProvidersProps {
  children: React.ReactNode;
}

const antdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
};

/**
 * Подключает корневые runtime providers приложения.
 *
 * @remarks
 * Сейчас здесь инициализируется только Ant Design.
 * По мере роста приложения сюда могут добавляться и другие
 * app-level провайдеры, например query/auth/i18n.
 */
export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
