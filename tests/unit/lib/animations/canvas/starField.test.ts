import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createParticles,
  drawParticles,
  startStarField,
  stepParticles,
  type StarFieldPreset,
} from '@/lib/animations/canvas/starField';

const PRESET: StarFieldPreset = {
  colors: ['#ffd700', '#ffffff'],
  sizeRange: [2, 6],
  opacityRange: [0.5, 1],
  opacitySpeed: 0.5,
  speed: 30,
  twinklePerSecond: 0,
  twinkleSeconds: 0.25,
  glow: { color: '#fbbf24', blur: 10 },
  points: 5,
};

/** Deterministic pseudo-random sequence (mulberry32). */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fakeCanvas() {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
    shadowColor: '',
    shadowBlur: 0,
  };
  const canvas = {
    width: 0,
    height: 0,
    clientWidth: 400,
    clientHeight: 300,
    getContext: vi.fn(() => ctx),
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx };
}

describe('createParticles', () => {
  it('creates the requested count inside the area with preset sizes and colours', () => {
    const particles = createParticles(PRESET, 400, 300, 25, seeded(1));
    expect(particles).toHaveLength(25);
    for (const p of particles) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(400);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(300);
      expect(p.size).toBeGreaterThanOrEqual(2);
      expect(p.size).toBeLessThanOrEqual(6);
      expect(PRESET.colors).toContain(p.color);
      expect(Math.hypot(p.vx, p.vy)).toBeLessThanOrEqual(PRESET.speed + 1e-9);
    }
  });

  it('spreads colours evenly across the palette, whatever the random draw', () => {
    // 2026-10-17 verdict: a 5-star panel drawn almost all yellow read as "less colourful".
    const palette = { ...PRESET, colors: ['#a', '#b', '#c'] };
    for (const seed of [1, 2, 3, 4]) {
      const counts = new Map<string, number>();
      for (const p of createParticles(palette, 400, 300, 7, seeded(seed))) {
        counts.set(p.color, (counts.get(p.color) ?? 0) + 1);
      }
      expect([...counts.values()].sort()).toEqual([2, 2, 3]);
    }
  });

  it('gives each star its own opacity speed, up to the preset maximum (tsParticles: speed x random)', () => {
    const particles = createParticles(PRESET, 400, 300, 50, seeded(5));
    const speeds = particles.map((p) => p.opacitySpeed);
    for (const s of speeds) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(PRESET.opacitySpeed);
    }
    expect(new Set(speeds).size).toBeGreaterThan(40);
  });
});

describe('stepParticles', () => {
  it('bounces a particle off the right edge', () => {
    const [p] = createParticles(PRESET, 400, 300, 1, seeded(2));
    Object.assign(p!, { x: 399, y: 150, vx: 30, vy: 0 });
    stepParticles([p!], PRESET, 0.1, 400, 300, seeded(3));
    expect(p!.vx).toBeLessThan(0);
    expect(p!.x).toBeLessThanOrEqual(400);
  });

  it('keeps opacity inside the preset range over time', () => {
    const particles = createParticles(PRESET, 400, 300, 10, seeded(4));
    const random = seeded(5);
    for (let frame = 0; frame < 600; frame += 1) {
      stepParticles(particles, PRESET, 1 / 30, 400, 300, random);
      for (const p of particles) {
        expect(p.opacity).toBeGreaterThanOrEqual(0.5);
        expect(p.opacity).toBeLessThanOrEqual(1);
      }
    }
  });

  it('flashes a particle to full opacity when it twinkles', () => {
    const twinkling = { ...PRESET, twinklePerSecond: 1000 };
    const particles = createParticles(twinkling, 400, 300, 3, seeded(6));
    stepParticles(particles, twinkling, 1 / 30, 400, 300, () => 0);
    for (const p of particles) expect(p.twinkle).toBe(1);
  });
});

describe('drawParticles', () => {
  it('draws tsParticles-sized stars: tips at twice the size, valleys at the size', () => {
    const { canvas, ctx } = fakeCanvas();
    void canvas;
    const [p] = createParticles(PRESET, 400, 300, 1, seeded(10));
    Object.assign(p!, { x: 100, y: 100, size: 4 });
    drawParticles(
      ctx as unknown as CanvasRenderingContext2D,
      [p!],
      PRESET,
      400,
      300
    );
    expect(ctx.moveTo).toHaveBeenCalledWith(100, 92);
    const [vx, vy] = ctx.lineTo.mock.calls[0]!;
    expect(Math.hypot(vx - 100, vy - 100)).toBeCloseTo(4);
  });
});

describe('startStarField', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('draws one static frame and schedules nothing under reduced motion', () => {
    const raf = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);
    const { canvas, ctx } = fakeCanvas();
    const field = startStarField(canvas, PRESET, {
      count: 12,
      reducedMotion: true,
      random: seeded(7),
    });
    expect(ctx.fill).toHaveBeenCalledTimes(12);
    expect(raf).not.toHaveBeenCalled();
    field.destroy();
  });

  it('stays paused by its caller when the tab becomes visible again', () => {
    const raf = vi.fn(() => 7);
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { canvas } = fakeCanvas();
    const field = startStarField(canvas, PRESET, {
      count: 3,
      reducedMotion: false,
      random: seeded(9),
    });
    field.pause();
    raf.mockClear();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(raf).not.toHaveBeenCalled();
    field.destroy();
  });

  it('cancels its animation frame on destroy', () => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 42)
    );
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    const { canvas } = fakeCanvas();
    const field = startStarField(canvas, PRESET, {
      count: 5,
      reducedMotion: false,
      random: seeded(8),
    });
    field.destroy();
    expect(cancel).toHaveBeenCalledWith(42);
  });
});
