/**
 * UnicornHero - Interactive unicorn mascot
 * ISO/IEC 25010 - SRP: Unicorn display + interactions only
 */

'use client';

import { useRestartableAnimation } from '@/hooks/useRestartableAnimation';

export function UnicornHero() {
  const pop = useRestartableAnimation('unicorn-pop');

  return (
    <div className="unicorn-bob inline-block">
      <div
        data-tour="logo"
        className={`text-8xl sm:text-9xl mb-6 cursor-pointer select-none unicorn-interactive ${pop.className}`}
        onClick={pop.trigger}
        onAnimationEnd={(e) => {
          if (e.animationName === 'unicorn-pop') pop.reset();
        }}
        style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
      >
        🦄
      </div>
    </div>
  );
}
