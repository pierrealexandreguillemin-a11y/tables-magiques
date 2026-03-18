/**
 * HomeContent
 * ISO/IEC 25010 - SRP: Main content only
 * CSS animations — zero Framer Motion
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  GradientText,
  GradientBorder,
  PulseGlow,
  MagneticButton,
} from '@/components/effects';
import { LazyKawaiiMascot } from '@/lib/animations';

export function HomeContent() {
  const [popping, setPopping] = useState(false);

  const handleUnicornClick = useCallback(() => {
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  }, []);

  return (
    <div className="text-center z-10 relative px-4">
      {/* Licorne — outer: CSS bob (infinite), inner: CSS interactions (hover/tap/click) */}
      <div className="unicorn-bob inline-block">
        <div
          data-tour="logo"
          className={`text-8xl sm:text-9xl mb-6 cursor-pointer select-none unicorn-interactive ${popping ? 'unicorn-pop' : ''}`}
          onClick={handleUnicornClick}
          onAnimationEnd={(e) => {
            if (e.animationName === 'unicorn-pop') setPopping(false);
          }}
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
        >
          🦄
        </div>
      </div>

      <h1
        className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 animate-title-enter"
        style={{
          textShadow:
            '0 0 40px rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <GradientText variant="rainbow" animate as="span">
          Tables Magiques
        </GradientText>
      </h1>

      <p
        className="text-xl sm:text-2xl text-white/90 mb-8 font-medium animate-fade-up"
        style={{ '--delay': '0.8s' } as React.CSSProperties}
      >
        Apprends tes multiplications en t&apos;amusant !
      </p>

      <div
        className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-scale"
        style={{ '--delay': '1.2s' } as React.CSSProperties}
      >
        {/* Mode Entrainement - Glassmorphism premium */}
        <Link href="/practice" data-tour="practice-button">
          <PulseGlow color="#a855f7" intensity="medium">
            <GradientBorder variant="unicorn" animate glow borderWidth={3}>
              <MagneticButton
                className="text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                  bg-white/20 backdrop-blur-xl backdrop-saturate-150
                  border border-white/30
                  text-white
                  hover:bg-white/30 hover:border-white/50
                  transition-all duration-300"
                style={{
                  boxShadow:
                    '0 8px 32px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                🎮 Mode Entraînement
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
        </Link>

        {/* Mode Challenge - Glassmorphism premium */}
        <Link href="/challenge" data-tour="challenge-button">
          <PulseGlow color="#f97316" intensity="medium">
            <GradientBorder variant="star" animate glow borderWidth={3}>
              <MagneticButton
                className="text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                  bg-gradient-to-r from-orange-500/40 to-red-500/40
                  backdrop-blur-xl backdrop-saturate-150
                  border border-white/30
                  text-white
                  hover:from-orange-500/60 hover:to-red-500/60 hover:border-white/50
                  transition-all duration-300"
                style={{
                  boxShadow:
                    '0 8px 32px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                🔥 Mode Challenge
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
        </Link>
      </div>

      <div
        className="mt-12 flex justify-center animate-fade-scale"
        style={{ '--delay': '1.8s' } as React.CSSProperties}
      >
        <LazyKawaiiMascot character="planet" mood="blissful" size={100} />
      </div>
    </div>
  );
}
