import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const field = {
  resize: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
};
const startStarField = vi.fn<(...args: unknown[]) => typeof field>(() => field);

vi.mock('@/lib/animations/canvas/starField', () => ({
  startStarField: (...args: unknown[]) => startStarField(...args),
}));

const reducedMotion = { shouldAnimate: true, prefersReducedMotion: false };
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => reducedMotion,
}));

import { StarField } from '@/components/effects/StarField';
import { STAR_FIELD_PRESETS } from '@/lib/animations/canvas/starFieldPresets';

class ObserverStub {
  constructor(public callback: (entries: unknown[]) => void) {}
  observe = vi.fn();
  disconnect = vi.fn();
}

describe('StarField', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ObserverStub);
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    startStarField.mockClear();
    field.destroy.mockClear();
    reducedMotion.shouldAnimate = true;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders a decorative canvas', () => {
    const { container } = render(<StarField preset="fairy" baseCount={40} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('starts the field with the preset and an animated loop', () => {
    render(<StarField preset="sparkles" baseCount={30} />);
    expect(startStarField).toHaveBeenCalledTimes(1);
    const [, preset, options] = startStarField.mock.calls[0]!;
    expect(preset).toBe(STAR_FIELD_PRESETS.sparkles);
    expect(options).toMatchObject({ reducedMotion: false });
  });

  it('draws a static field under reduced motion', () => {
    reducedMotion.shouldAnimate = false;
    render(<StarField preset="fairy" baseCount={40} />);
    expect(startStarField.mock.calls[0]![2]).toMatchObject({
      reducedMotion: true,
    });
  });

  it('destroys the field on unmount', () => {
    const { unmount } = render(<StarField preset="fairy" baseCount={40} />);
    unmount();
    expect(field.destroy).toHaveBeenCalledTimes(1);
  });
});
