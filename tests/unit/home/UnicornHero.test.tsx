/**
 * Tests UnicornHero
 * ISO/IEC 29119 - Tests unitaires
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UnicornHero } from '@/features/home/components/UnicornHero';

describe('UnicornHero', () => {
  it('renders the unicorn emoji', () => {
    render(<UnicornHero />);
    expect(screen.getByText('🦄')).toBeInTheDocument();
  });

  it('has data-tour="logo" for onboarding', () => {
    render(<UnicornHero />);
    const inner = screen.getByText('🦄');
    expect(inner).toHaveAttribute('data-tour', 'logo');
  });

  it('has unicorn-bob class on outer wrapper', () => {
    render(<UnicornHero />);
    const outer = screen.getByText('🦄').parentElement;
    expect(outer).toHaveClass('unicorn-bob');
  });

  it('has unicorn-interactive class on inner element', () => {
    render(<UnicornHero />);
    const inner = screen.getByText('🦄');
    expect(inner).toHaveClass('unicorn-interactive');
  });

  it('does not have unicorn-pop class initially', () => {
    render(<UnicornHero />);
    const inner = screen.getByText('🦄');
    expect(inner).not.toHaveClass('unicorn-pop');
  });

  it('adds unicorn-pop class on click via rAF toggle', async () => {
    // Mock rAF to execute callback synchronously
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<UnicornHero />);
    const inner = screen.getByText('🦄');

    await act(() => {
      fireEvent.click(inner);
    });

    expect(screen.getByText('🦄').className).toContain('unicorn-pop');

    vi.restoreAllMocks();
  });

  it('removes unicorn-pop class on animationEnd', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<UnicornHero />);
    const inner = screen.getByText('🦄');

    await act(() => {
      fireEvent.click(inner);
    });

    expect(screen.getByText('🦄').className).toContain('unicorn-pop');

    await act(() => {
      const el = screen.getByText('🦄');
      const event = new Event('animationend', { bubbles: true });
      Object.defineProperty(event, 'animationName', {
        value: 'unicorn-pop',
      });
      el.dispatchEvent(event);
    });

    expect(screen.getByText('🦄').className).not.toContain('unicorn-pop');

    vi.restoreAllMocks();
  });
});
