import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fire, create } = vi.hoisted(() => {
  const fire = Object.assign(vi.fn(), { reset: vi.fn() });
  return {
    fire,
    create: vi.fn<(...args: unknown[]) => typeof fire>(() => fire),
  };
});
vi.mock('canvas-confetti', () => ({ default: { create } }));

import { scatterConfetti } from '@/lib/animations/canvas/confettiScatter';
import { CONFETTI_COLORS } from '@/lib/animations/colors';

const canvas = {} as HTMLCanvasElement;

describe('scatterConfetti', () => {
  beforeEach(() => {
    fire.mockClear();
    fire.reset.mockClear();
    create.mockClear();
  });

  it('uses every confetti colour across the scatter', () => {
    let n = 0;
    scatterConfetti(canvas, {
      reducedMotion: false,
      random: () => (n++ % 10) / 10,
    });
    const used = new Set(fire.mock.calls.map(([options]) => options.colors[0]));
    expect(used.size).toBe(CONFETTI_COLORS.length);
  });

  it('scatters 100 confetti that live 3 s, like the former tsParticles config', () => {
    scatterConfetti(canvas, { reducedMotion: false, random: () => 0.5 });
    expect(create).toHaveBeenCalledWith(
      canvas,
      expect.objectContaining({ resize: true })
    );
    const calls = fire.mock.calls.map(([options]) => options);
    expect(calls.reduce((sum, o) => sum + o.particleCount, 0)).toBe(100);
    for (const options of calls) {
      expect(options.colors).toHaveLength(1);
      expect(CONFETTI_COLORS).toContain(options.colors[0]);
      expect(options.shapes).toEqual(['square', 'circle']);
      expect(options.ticks).toBe(180);
    }
  });

  it('fires nothing under reduced motion', () => {
    scatterConfetti(canvas, { reducedMotion: true });
    expect(fire).not.toHaveBeenCalled();
  });

  it('clears the canvas on stop', () => {
    const burst = scatterConfetti(canvas, { reducedMotion: false });
    burst.stop();
    expect(fire.reset).toHaveBeenCalledTimes(1);
  });
});
