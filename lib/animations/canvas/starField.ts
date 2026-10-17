/**
 * Star field - lightweight canvas renderer for twinkling star backgrounds.
 * ISO/IEC 25010 - Performance: replaces tsParticles (39 KB gz) for the two star presets.
 *
 * The particle model is pure (injectable random) so it is unit-tested without a canvas;
 * startStarField owns the render loop: fps limit, pause when the tab is hidden,
 * one static frame under reduced motion.
 */

export interface StarFieldPreset {
  colors: readonly string[];
  /** tsParticles size range in CSS px: valley radius, tips reach 2x */
  sizeRange: readonly [number, number];
  opacityRange: readonly [number, number];
  /** Full opacity sweeps (min -> max) per second */
  opacitySpeed: number;
  /** Max drift speed in CSS px per second */
  speed: number;
  /** Probability per second that a star flashes to full opacity */
  twinklePerSecond: number;
  /** How long a twinkle flash lasts, in seconds */
  twinkleSeconds: number;
  glow: { color: string; blur: number } | null;
  /** Number of star branches */
  points: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  opacityDirection: 1 | -1;
  /** Twinkle flash, 1 = full opacity, decays to 0 */
  twinkle: number;
}

export type Random = () => number;

/** Tips at size x STAR_INSET, valleys at size (@tsparticles/shape-star Utils.js, default inset 2). */
const STAR_INSET = 2;

const between = (random: Random, [min, max]: readonly [number, number]) =>
  min + random() * (max - min);

export function createParticles(
  preset: StarFieldPreset,
  width: number,
  height: number,
  count: number,
  random: Random
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const speed = random() * preset.speed;
    return {
      x: random() * width,
      y: random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: between(random, preset.sizeRange),
      color: preset.colors[Math.floor(random() * preset.colors.length)]!,
      opacity: between(random, preset.opacityRange),
      opacityDirection: random() < 0.5 ? 1 : -1,
      twinkle: 0,
    };
  });
}

function bounce(position: number, velocity: number, limit: number) {
  if (position < 0) return { position: -position, velocity: -velocity };
  if (position > limit)
    return { position: 2 * limit - position, velocity: -velocity };
  return { position, velocity };
}

export function stepParticles(
  particles: Particle[],
  preset: StarFieldPreset,
  dt: number,
  width: number,
  height: number,
  random: Random
): void {
  const [minOpacity, maxOpacity] = preset.opacityRange;
  const opacityStep = preset.opacitySpeed * dt * (maxOpacity - minOpacity);
  for (const p of particles) {
    const x = bounce(p.x + p.vx * dt, p.vx, width);
    const y = bounce(p.y + p.vy * dt, p.vy, height);
    p.x = x.position;
    p.vx = x.velocity;
    p.y = y.position;
    p.vy = y.velocity;

    p.opacity += p.opacityDirection * opacityStep;
    if (p.opacity >= maxOpacity || p.opacity <= minOpacity) {
      p.opacity = Math.min(maxOpacity, Math.max(minOpacity, p.opacity));
      p.opacityDirection = p.opacityDirection === 1 ? -1 : 1;
    }

    p.twinkle = Math.max(0, p.twinkle - dt / preset.twinkleSeconds);
    if (random() < preset.twinklePerSecond * dt) p.twinkle = 1;
  }
}

function traceStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  points: number
) {
  const tip = radius * STAR_INSET;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? tip : radius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly Particle[],
  preset: StarFieldPreset,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (preset.glow) {
    ctx.shadowColor = preset.glow.color;
    ctx.shadowBlur = preset.glow.blur;
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.max(p.opacity, p.twinkle);
    ctx.fillStyle = p.color;
    traceStar(ctx, p.x, p.y, p.size, preset.points);
    ctx.fill();
  }
  ctx.restore();
}

export interface StarFieldOptions {
  count: number;
  reducedMotion: boolean;
  /** Frames per second cap (tsParticles configs used 30) */
  fps?: number;
  random?: Random;
}

export interface StarField {
  /** Re-read the canvas CSS size (call on resize). */
  resize(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export function startStarField(
  canvas: HTMLCanvasElement,
  preset: StarFieldPreset,
  { count, reducedMotion, fps = 30, random = Math.random }: StarFieldOptions
): StarField {
  const ctx = canvas.getContext('2d');
  const frameMs = 1000 / fps;
  let width = 0;
  let height = 0;
  let frame: number | null = null;
  let last = 0;
  // Two independent reasons to stop: the caller (e.g. off-screen) and a hidden tab.
  let callerPaused = false;
  let tabHidden = false;

  const draw = () => {
    if (ctx) drawParticles(ctx, particles, preset, width, height);
  };

  const resize = () => {
    const dpr =
      typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  const particles = createParticles(preset, width, height, count, random);

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const elapsed = now - last;
    if (elapsed < frameMs) return;
    // Clamp long gaps (tab switch) so stars do not jump.
    stepParticles(
      particles,
      preset,
      Math.min(elapsed, 100) / 1000,
      width,
      height,
      random
    );
    last = now;
    draw();
  };

  const sync = () => {
    const shouldRun = !reducedMotion && !callerPaused && !tabHidden;
    if (shouldRun && frame === null) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!shouldRun && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };

  const onVisibility = () => {
    tabHidden = document.hidden;
    sync();
  };

  draw();
  sync();
  if (!reducedMotion)
    document.addEventListener('visibilitychange', onVisibility);

  return {
    resize: () => {
      resize();
      draw();
    },
    pause: () => {
      callerPaused = true;
      sync();
    },
    resume: () => {
      callerPaused = false;
      sync();
    },
    destroy: () => {
      callerPaused = true;
      sync();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
