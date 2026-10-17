/**
 * Shared motion mocks for unit tests (jsdom has no animation frames to drive motion).
 *
 * Usage, at the top of a test file:
 *   vi.mock('motion/react-m', async () => (await import('@/tests/utils/motionMock')).motionReactM);
 *   vi.mock('motion/react', async () => (await import('@/tests/utils/motionMock')).motionReact);
 * Override one export by spreading: ({ ...(await import(...)).motionReact, useInView: () => false }).
 */

import React from 'react';
import { vi } from 'vitest';

/** Props that only motion understands; stripped so React does not warn on DOM nodes. */
const MOTION_ONLY_PROPS = [
  'animate',
  'custom',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'onAnimationComplete',
  'onAnimationStart',
  'transition',
  'variants',
  'whileFocus',
  'whileHover',
  'whileInView',
  'whileTap',
  'viewport',
] as const;

type AnyProps = React.PropsWithChildren<Record<string, unknown>>;

function createElementMock(tag: string) {
  function MotionElementMock({ children, ...props }: AnyProps) {
    // Default test id (motion-span, motion-div…) unless the component sets one.
    const domProps: Record<string, unknown> = {
      'data-testid': `motion-${tag}`,
      ...props,
    };
    for (const key of MOTION_ONLY_PROPS) delete domProps[key];
    return React.createElement(tag, domProps, children as React.ReactNode);
  }
  MotionElementMock.displayName = `m.${tag}`;
  return MotionElementMock;
}

/**
 * Tags rendered as m.* in the app (grep -rhoE "\bm\.[a-z]+" app components features),
 * plus common ones. Vitest checks that every accessed export exists, so a missing tag
 * fails with an explicit "No \"<tag>\" export is defined" error: add it here.
 */
const TAGS = [
  'article',
  'button',
  'circle',
  'div',
  'form',
  'li',
  'p',
  'path',
  'section',
  'span',
  'svg',
  'ul',
];

/** `m.div`, `m.span`, `m.path`… each tag renders a plain DOM element. */
export const motionReactM = Object.fromEntries(
  TAGS.map((tag) => [tag, createElementMock(tag)])
);

function Passthrough({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

/** Motion value stub: `.on('change', cb)` fires once with the mapped initial value. */
function motionValue(initial: number) {
  return {
    get: () => initial,
    set: vi.fn(),
    on: vi.fn((event: string, callback: (value: number) => void) => {
      if (event === 'change') callback(initial);
      return vi.fn();
    }),
  };
}

export const motionReact = {
  AnimatePresence: Passthrough,
  LazyMotion: Passthrough,
  MotionConfig: Passthrough,
  useAnimationControls: () => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useInView: () => true,
  useReducedMotion: () => false,
  useSpring: () => motionValue(0),
  useTransform: (_source: unknown, transform: (value: number) => number) =>
    motionValue(transform(0)),
};
