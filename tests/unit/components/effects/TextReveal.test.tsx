/**
 * TextReveal Tests - ISO 29119
 * Tests contre production - Mock imports uniquement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextReveal, WordReveal } from '@/components/effects/TextReveal';

// Mock useReducedMotion - import mock uniquement
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
  })),
}));

// Mock framer-motion avec composants testables
vi.mock('framer-motion', () => ({
  motion: {
    span: ({
      children,
      className,
      style,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span
        className={className}
        style={style}
        data-testid="motion-span"
        {...props}
      >
        {children}
      </span>
    ),
  },
}));

describe('TextReveal', () => {
  describe('Character splitting', () => {
    it('splits text into individual characters', () => {
      render(<TextReveal>Hello</TextReveal>);
      const spans = screen.getAllByTestId('motion-span');
      // Container + 5 characters
      expect(spans.length).toBeGreaterThanOrEqual(5);
    });

    it('preserves spaces as non-breaking spaces', () => {
      render(<TextReveal>A B</TextReveal>);
      // The space should be rendered as \u00A0
      const allSpans = screen.getAllByTestId('motion-span');
      const spaceSpan = allSpans.find((span) => span.textContent === '\u00A0');
      expect(spaceSpan).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with fade variant (default)', () => {
      render(<TextReveal variant="fade">Test</TextReveal>);
      expect(screen.getByText(/T/)).toBeInTheDocument();
    });

    it('renders with slide variant', () => {
      render(<TextReveal variant="slide">Test</TextReveal>);
      expect(screen.getByText(/T/)).toBeInTheDocument();
    });

    it('renders with typewriter variant', () => {
      render(<TextReveal variant="typewriter">Test</TextReveal>);
      expect(screen.getByText(/T/)).toBeInTheDocument();
    });

    it('renders with blur variant', () => {
      render(<TextReveal variant="blur">Test</TextReveal>);
      expect(screen.getByText(/T/)).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      render(<TextReveal className="custom-text">Test</TextReveal>);
      const container = screen.getAllByTestId('motion-span')[0];
      expect(container).toHaveClass('custom-text');
    });
  });

  describe('Reduced motion', () => {
    it('renders plain text when shouldAnimate is false', async () => {
      vi.resetModules();

      vi.doMock('@/hooks/useReducedMotion', () => ({
        useReducedMotion: vi.fn(() => ({
          prefersReducedMotion: true,
          shouldAnimate: false,
        })),
      }));

      const { TextReveal: TextRevealNoMotion } =
        await import('@/components/effects/TextReveal');

      render(<TextRevealNoMotion>Hello</TextRevealNoMotion>);
      // Without animation, should render as plain span
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('Animation callbacks', () => {
    it('accepts onComplete callback', () => {
      const onComplete = vi.fn();
      render(<TextReveal onComplete={onComplete}>Test</TextReveal>);
      // Just verify it renders without error
      expect(screen.getAllByTestId('motion-span').length).toBeGreaterThan(0);
    });
  });
});

describe('WordReveal', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock('@/hooks/useReducedMotion', () => ({
      useReducedMotion: vi.fn(() => ({
        prefersReducedMotion: false,
        shouldAnimate: true,
      })),
    }));
  });

  describe('Word splitting', () => {
    it('splits text into words', () => {
      render(<WordReveal>Hello World Test</WordReveal>);
      const spans = screen.getAllByTestId('motion-span');
      // Container + 3 words
      expect(spans.length).toBeGreaterThanOrEqual(3);
    });

    it('renders each word in its own span', () => {
      render(<WordReveal>One Two</WordReveal>);
      expect(screen.getByText('One')).toBeInTheDocument();
      expect(screen.getByText('Two')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with fade variant (default)', () => {
      render(<WordReveal variant="fade">Test Text</WordReveal>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders with slide variant', () => {
      render(<WordReveal variant="slide">Test Text</WordReveal>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<WordReveal className="word-class">Test</WordReveal>);
      const container = screen.getAllByTestId('motion-span')[0];
      expect(container).toHaveClass('word-class');
    });
  });

  describe('Reduced motion', () => {
    it('renders plain text when shouldAnimate is false', async () => {
      vi.resetModules();

      vi.doMock('@/hooks/useReducedMotion', () => ({
        useReducedMotion: vi.fn(() => ({
          prefersReducedMotion: true,
          shouldAnimate: false,
        })),
      }));

      const { WordReveal: WordRevealNoMotion } =
        await import('@/components/effects/TextReveal');

      render(<WordRevealNoMotion>Hello World</WordRevealNoMotion>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });
});
