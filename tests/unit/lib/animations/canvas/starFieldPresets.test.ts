import { describe, expect, it } from 'vitest';
import { scaledCount } from '@/lib/animations/canvas/starFieldPresets';

describe('scaledCount (tsParticles density formula)', () => {
  it('keeps the base count at the reference area', () => {
    expect(scaledCount('fairy', 40, 1920, 1080)).toBe(40);
    expect(scaledCount('sparkles', 30, 600, 600)).toBe(30);
  });

  it('scales with the viewport area', () => {
    expect(scaledCount('fairy', 40, 960, 540)).toBe(10);
    expect(scaledCount('sparkles', 30, 1200, 600)).toBe(60);
  });

  it('never returns zero', () => {
    expect(scaledCount('fairy', 40, 10, 10)).toBe(1);
  });
});
