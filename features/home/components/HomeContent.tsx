/**
 * HomeContent
 * ISO/IEC 25010 - SRP: Main content only
 * CSS animations — zero Framer Motion
 */

'use client';

import Link from 'next/link';
import { GradientText, GradientBorder } from '@/components/effects';
import { LazyKawaiiMascot } from '@/lib/animations';
import { UnicornHero } from './UnicornHero';

export function HomeContent() {
  return (
    <div className="text-center z-10 relative px-4">
      {/* Licorne — extracted to UnicornHero (SRP) */}
      <UnicornHero />

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 animate-title-enter shadow-title-magic">
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
        <Link href="/practice" data-tour="practice-button" className="block">
          <GradientBorder variant="unicorn" animate glow borderWidth={3}>
            <span
              className="block text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                bg-white/20 backdrop-blur-xl backdrop-saturate-150
                border border-white/30
                text-white
                hover:bg-white/30 hover:border-white/50
                transition-all duration-300 shadow-btn-unicorn"
            >
              🎮 Mode Entraînement
            </span>
          </GradientBorder>
        </Link>

        {/* Mode Challenge - Glassmorphism premium */}
        <Link href="/challenge" data-tour="challenge-button" className="block">
          <GradientBorder variant="star" animate glow borderWidth={3}>
            <span
              className="block text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                bg-gradient-to-r from-orange-500/40 to-red-500/40
                backdrop-blur-xl backdrop-saturate-150
                border border-white/30
                text-white
                hover:from-orange-500/60 hover:to-red-500/60 hover:border-white/50
                transition-all duration-300 shadow-btn-challenge"
            >
              🔥 Mode Challenge
            </span>
          </GradientBorder>
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
