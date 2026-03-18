/**
 * FloatingParticles
 * ISO/IEC 25010 - SRP: Particle rendering only
 * CSS keyframes — zero JS per frame
 */

'use client';

import { memo } from 'react';
import type { Particle, Star } from '../hooks/useParticles';

interface Props {
  particles: Particle[];
  stars: Star[];
}

export const FloatingParticles = memo(function FloatingParticles({
  particles,
  stars,
}: Props) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none floating-particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--x-offset': `${p.xOffset}px`,
            } as React.CSSProperties
          }
        />
      ))}

      {stars.map((s) => (
        <div
          key={`star-${s.id}`}
          className="absolute text-2xl pointer-events-none floating-star"
          style={
            {
              left: s.left,
              top: s.top,
              '--duration': `${s.duration}s`,
              '--delay': `${s.delay}s`,
            } as React.CSSProperties
          }
        >
          ✨
        </div>
      ))}
    </>
  );
});
