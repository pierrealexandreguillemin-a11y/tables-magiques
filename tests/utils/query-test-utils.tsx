/**
 * Test Utilities - React Query
 * ISO/IEC 29119 - Utilitaires pour tests hooks React Query
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { RenderHookOptions } from '@testing-library/react';

/**
 * Cree un QueryClient pour les tests
 * Configuration isolee sans cache persistant
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper avec QueryClientProvider pour les tests
 */
export function createQueryWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();

  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

/**
 * Render hook avec React Query wrapper
 */
export function renderQueryHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) {
  const { queryClient, ...renderOptions } = options ?? {};

  return renderHook(hook, {
    ...renderOptions,
    wrapper: createQueryWrapper(queryClient),
  });
}
