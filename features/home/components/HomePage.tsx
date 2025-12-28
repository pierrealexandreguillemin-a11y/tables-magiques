/**
 * HomePage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only (<50 lines)
 */

'use client';

import { FairyBackground } from '@/components/effects';
import { OnboardingTour } from '@/features/onboarding';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import { useParticles } from '../hooks/useParticles';
import { HomeHeader } from './HomeHeader';
import { FloatingParticles } from './FloatingParticles';
import { RainbowDecorations } from './RainbowDecorations';
import { HomeContent } from './HomeContent';

export function HomePage() {
  const { containerRef, titleRef, unicornRef, handleUnicornClick } =
    useHomeAnimations();
  const { particles, stars } = useParticles();

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900"
      style={{ backgroundSize: '400% 400%' }}
    >
      <FairyBackground />
      <HomeHeader />
      <FloatingParticles particles={particles} stars={stars} />
      <RainbowDecorations />
      <HomeContent
        titleRef={titleRef}
        unicornRef={unicornRef}
        onUnicornClick={handleUnicornClick}
      />
      <OnboardingTour autoStart />
    </main>
  );
}
