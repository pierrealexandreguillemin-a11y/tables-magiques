/**
 * batch-a.test.tsx
 * Unit tests for effect components with 0% coverage:
 *   - ParticlesBackground
 *   - ConsoleBanner
 *   - NumberReveal
 */

import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — declared before any imports that use them
// ---------------------------------------------------------------------------

// motion: shared mocks (tests/utils/motionMock.tsx)
vi.mock(
  'motion/react-m',
  async () => (await import('@/tests/utils/motionMock')).motionReactM
);
vi.mock(
  'motion/react',
  async () => (await import('@/tests/utils/motionMock')).motionReact
);

vi.mock('@/components/effects/StarField', () => ({
  StarField: ({ preset, baseCount }: { preset: string; baseCount: number }) => (
    <canvas
      data-testid="star-field"
      data-preset={preset}
      data-base-count={baseCount}
    />
  ),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  })),
  default: vi.fn(() => ({ shouldAnimate: true, prefersReducedMotion: false })),
}));

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------

import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { ConsoleBanner } from '@/components/effects/console-banner';
import { NumberReveal } from '@/components/effects/NumberReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BASE_COUNT } from '@/lib/animations/canvas/starFieldPresets';

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

  it('renders the star field inside the wrapper', () => {
    render(<ParticlesBackground />);
    expect(screen.getByTestId('star-field')).toBeTruthy();
  });

  it('passes the preset and its base count to the star field', () => {
    render(<ParticlesBackground preset="fairy" />);
    const field = screen.getByTestId('star-field');
    expect(field.getAttribute('data-preset')).toBe('fairy');
    expect(field.getAttribute('data-base-count')).toBe(
      String(BASE_COUNT.fairy)
    );
  });

  it('returns null when shouldAnimate is false', () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });
    const { container } = render(<ParticlesBackground />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the sparkles preset by default (its only use: challenge page)', () => {
    render(<ParticlesBackground />);
    expect(screen.getByTestId('star-field').getAttribute('data-preset')).toBe(
      'sparkles'
    );
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
