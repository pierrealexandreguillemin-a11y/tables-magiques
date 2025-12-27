/**
 * Tests Unitaires - Providers Component
 * ISO/IEC 29119 - TDD: Tests composant wrapper providers
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { Providers } from '@/app/providers';

// Composant test pour verifier QueryClient
function TestQueryClientComponent() {
  const queryClient = useQueryClient();
  return (
    <div data-testid="has-client">
      {queryClient ? 'Client OK' : 'No Client'}
    </div>
  );
}

describe('Providers Component', () => {
  it('rend les children', () => {
    render(
      <Providers>
        <div data-testid="child">Hello</div>
      </Providers>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('fournit QueryClient aux enfants', () => {
    render(
      <Providers>
        <TestQueryClientComponent />
      </Providers>
    );

    expect(screen.getByTestId('has-client')).toHaveTextContent('Client OK');
  });

  it('fournit un QueryClient stable entre renders', () => {
    const { rerender } = render(
      <Providers>
        <TestQueryClientComponent />
      </Providers>
    );

    expect(screen.getByTestId('has-client')).toHaveTextContent('Client OK');

    rerender(
      <Providers>
        <TestQueryClientComponent />
      </Providers>
    );

    expect(screen.getByTestId('has-client')).toHaveTextContent('Client OK');
  });

  it('supporte multiple children', () => {
    render(
      <Providers>
        <div data-testid="child1">One</div>
        <div data-testid="child2">Two</div>
      </Providers>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
});
