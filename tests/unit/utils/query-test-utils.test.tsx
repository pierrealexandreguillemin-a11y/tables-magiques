/**
 * Tests Unitaires - Query Test Utils
 * ISO/IEC 29119 - TDD: Tests utilitaires de test React Query
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createTestQueryClient,
  createQueryWrapper,
  renderQueryHook,
} from '../../utils/query-test-utils';

// Composant pour tester le wrapper
function TestComponent() {
  const queryClient = useQueryClient();
  return (
    <div data-testid="has-client">
      {queryClient ? 'Client OK' : 'No Client'}
    </div>
  );
}

// Hook simple pour tester renderQueryHook
function useTestHook() {
  const queryClient = useQueryClient();
  return { hasClient: !!queryClient };
}

describe('Query Test Utils', () => {
  describe('createTestQueryClient', () => {
    it('cree un QueryClient valide', () => {
      const client = createTestQueryClient();

      expect(client).toBeDefined();
      expect(typeof client.getQueryData).toBe('function');
    });

    it('configure retry: false', () => {
      const client = createTestQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.retry).toBe(false);
    });
  });

  describe('createQueryWrapper', () => {
    it('cree un wrapper fonctionnel', () => {
      const Wrapper = createQueryWrapper();

      render(
        <Wrapper>
          <TestComponent />
        </Wrapper>
      );

      expect(screen.getByTestId('has-client')).toHaveTextContent('Client OK');
    });

    it('accepte un QueryClient personnalise', () => {
      const customClient = createTestQueryClient();
      const Wrapper = createQueryWrapper(customClient);

      render(
        <Wrapper>
          <TestComponent />
        </Wrapper>
      );

      expect(screen.getByTestId('has-client')).toHaveTextContent('Client OK');
    });
  });

  describe('renderQueryHook', () => {
    it('rend un hook avec QueryClient', () => {
      const { result } = renderQueryHook(() => useTestHook());

      expect(result.current.hasClient).toBe(true);
    });
  });
});
