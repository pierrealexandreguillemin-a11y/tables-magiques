/**
 * useHomeAnimations Hook
 * ISO/IEC 25010 - SRP: GSAP animations only
 */

'use client';

import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function useHomeAnimations() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const unicornRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            opacity: 0,
            y: -100,
            scale: 0.5,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
          },
          0.3
        );
      }

      if (unicornRef.current) {
        gsap.to(unicornRef.current, {
          y: -25,
          rotation: 8,
          duration: 2.5,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      gsap.to(containerRef.current, {
        backgroundPosition: '100% 50%',
        duration: 15,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: containerRef, revertOnUpdate: false }
  );

  const handleUnicornClick = useCallback(() => {
    const safeAnimation = contextSafe(() => {
      if (!unicornRef.current) return;
      gsap.to(unicornRef.current, {
        scale: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    });
    safeAnimation();
  }, [contextSafe]);

  return { containerRef, titleRef, unicornRef, handleUnicornClick };
}
