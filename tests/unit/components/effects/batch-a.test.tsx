/**
 * batch-a.test.tsx
 * Unit tests for effect components with 0% coverage:
 *   - ParticlesBackground
 *   - MagneticButton
 *   - ConsoleBanner
 *   - NumberReveal
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — declared before any imports that use them
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => {
  const motion: Record<
    string,
    React.FC<React.HTMLAttributes<HTMLElement> & Record<string, unknown>>
  > = {};

  const tags = ['button', 'span', 'div', 'p', 'section', 'article'];
  tags.forEach((tag) => {
    motion[tag] = ({
      children,
      ...rest
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // Strip framer-motion-only props so React doesn't warn
      const {
        animate: _a,
        initial: _i,
        exit: _e,
        transition: _t,
        variants: _v,
        whileTap: _wt,
        whileHover: _wh,
        whileFocus: _wf,
        whileInView: _wiv,
        layout: _l,
        layoutId: _lid,
        ...domProps
      } = rest;
      return React.createElement(
        tag,
        domProps as React.HTMLAttributes<HTMLElement>,
        children
      );
    };
  });

  return {
    motion,
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => (
      <>{children}</>
    ),
    useSpring: () => ({
      set: vi.fn(),
      on: vi.fn(() => vi.fn()),
    }),
    useTransform: (_spring: unknown, fn: (v: number) => number) => ({
      on: vi.fn((event: string, cb: (v: number) => void) => {
        if (event === 'change') cb(fn(0));
        return vi.fn();
      }),
    }),
  };
});

vi.mock('@tsparticles/react', () => ({
  default: ({ id, className }: { id?: string; className?: string }) => (
    <div
      data-testid="tsparticles"
      data-particles-id={id}
      className={className}
    />
  ),
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  })),
  default: vi.fn(() => ({ shouldAnimate: true, prefersReducedMotion: false })),
}));

vi.mock('@/hooks/useParticlesEngine', () => ({
  useParticlesEngine: vi.fn(() => true),
}));

vi.mock('@/lib/animations', () => ({
  getParticleConfig: vi.fn(() => ({ fullScreen: false })),
}));

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------

import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { MagneticButton } from '@/components/effects/MagneticButton';
import { ConsoleBanner } from '@/components/effects/console-banner';
import { NumberReveal } from '@/components/effects/NumberReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParticlesEngine } from '@/hooks/useParticlesEngine';

// ---------------------------------------------------------------------------
// ParticlesBackground
// ---------------------------------------------------------------------------

describe('ParticlesBackground', () => {
  it('renders without crashing with default props', () => {
    const { container } = render(<ParticlesBackground />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the wrapper div with particle-layer class', () => {
    const { container } = render(<ParticlesBackground />);
    const wrapper = container.querySelector('.particle-layer');
    expect(wrapper).not.toBeNull();
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <ParticlesBackground className="custom-class" />
    );
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).not.toBeNull();
  });

  it('applies opacity style to wrapper', () => {
    const { container } = render(<ParticlesBackground opacity={0.5} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0.5');
  });

  it('renders tsParticles component inside wrapper', () => {
    render(<ParticlesBackground />);
    expect(screen.getByTestId('tsparticles')).toBeTruthy();
  });

  it('passes preset-based id to Particles', () => {
    render(<ParticlesBackground preset="stars" />);
    const particles = screen.getByTestId('tsparticles');
    expect(particles.getAttribute('data-particles-id')).toBe('particles-stars');
  });

  it('returns null when shouldAnimate is false', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    const { container } = render(<ParticlesBackground />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when engine is not ready', () => {
    vi.mocked(useParticlesEngine).mockReturnValueOnce(false);
    const { container } = render(<ParticlesBackground />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with fairy preset by default', () => {
    render(<ParticlesBackground />);
    const particles = screen.getByTestId('tsparticles');
    expect(particles.getAttribute('data-particles-id')).toBe('particles-fairy');
  });
});

// ---------------------------------------------------------------------------
// MagneticButton
// ---------------------------------------------------------------------------

describe('MagneticButton', () => {
  it('renders without crashing', () => {
    render(<MagneticButton>Click me</MagneticButton>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders a button element', () => {
    render(<MagneticButton>Label</MagneticButton>);
    const btn = screen.getByRole('button');
    expect(btn.tagName.toLowerCase()).toBe('button');
  });

  it('renders children text', () => {
    render(<MagneticButton>Magic</MagneticButton>);
    expect(screen.getByText('Magic')).toBeTruthy();
  });

  it('applies className prop', () => {
    render(<MagneticButton className="my-btn">Click</MagneticButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('my-btn');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MagneticButton onClick={handleClick}>Click</MagneticButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<MagneticButton disabled>Disabled</MagneticButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('sets type attribute correctly', () => {
    render(<MagneticButton type="submit">Submit</MagneticButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });

  it('defaults to type="button"', () => {
    render(<MagneticButton>Button</MagneticButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('button');
  });

  it('renders plain button when shouldAnimate is false', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    render(<MagneticButton className="no-anim">No anim</MagneticButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeTruthy();
    expect(btn.className).toBe('no-anim');
  });

  it('applies style prop', () => {
    render(<MagneticButton style={{ color: 'red' }}>Styled</MagneticButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.style.color).toBe('red');
  });

  it('does not call onClick when disabled and clicked', () => {
    const handleClick = vi.fn();
    render(
      <MagneticButton disabled onClick={handleClick}>
        Disabled
      </MagneticButton>
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ConsoleBanner
// ---------------------------------------------------------------------------

describe('ConsoleBanner', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders without crashing', () => {
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeTruthy();
  });

  it('returns null (renders no DOM elements)', () => {
    const { container } = render(<ConsoleBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('calls console.log after mount', () => {
    render(<ConsoleBanner />);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('calls console.log at least 3 times (banner + title + repo)', () => {
    render(<ConsoleBanner />);
    expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('logs the repo URL', () => {
    render(<ConsoleBanner />);
    const allArgs = consoleSpy.mock.calls.flat().join(' ');
    expect(allArgs).toContain('tables-magiques');
  });

  it('logs "Tables Magiques" branding', () => {
    render(<ConsoleBanner />);
    const allArgs = consoleSpy.mock.calls.flat().join(' ');
    expect(allArgs).toContain('Tables Magiques');
  });
});

// ---------------------------------------------------------------------------
// NumberReveal
// ---------------------------------------------------------------------------

describe('NumberReveal', () => {
  it('renders without crashing', () => {
    // In animated mode the spring starts at 0; check a span is present
    const { container } = render(<NumberReveal value={42} />);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
  });

  it('displays the provided value when reduced-motion disables animation', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    render(<NumberReveal value={99} />);
    expect(screen.getByText('99')).toBeTruthy();
  });

  it('renders prefix before the value', () => {
    render(<NumberReveal value={10} prefix="Score: " />);
    const container = screen.getByText(/Score:/);
    expect(container).toBeTruthy();
  });

  it('renders suffix after the value', () => {
    render(<NumberReveal value={10} suffix="pts" />);
    const container = screen.getByText(/pts/);
    expect(container).toBeTruthy();
  });

  it('applies className prop', () => {
    const { container } = render(
      <NumberReveal value={5} className="score-display" />
    );
    const el = container.querySelector('.score-display');
    expect(el).not.toBeNull();
  });

  it('renders a span element', () => {
    const { container } = render(<NumberReveal value={7} />);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
  });

  it('shows value directly when shouldAnimate is false', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    render(<NumberReveal value={123} />);
    expect(screen.getByText('123')).toBeTruthy();
  });

  it('shows prefix + value + suffix together when not animating', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    const { container } = render(
      <NumberReveal value={5} prefix="x" suffix="!" />
    );
    expect(container.textContent).toContain('x');
    expect(container.textContent).toContain('5');
    expect(container.textContent).toContain('!');
  });

  it('renders value 0 correctly', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    render(<NumberReveal value={0} />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('renders large numbers correctly', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    render(<NumberReveal value={1000000} />);
    expect(screen.getByText('1000000')).toBeTruthy();
  });
});
