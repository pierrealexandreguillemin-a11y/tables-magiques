/**
 * HomePage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only
 */

'use client';

import { FairyBackground } from '@/components/effects';
import { OnboardingTour } from '@/features/onboarding';
import { useParticles } from '../hooks/useParticles';
import { HomeHeader } from './HomeHeader';
import { FloatingParticles } from './FloatingParticles';
import { RainbowDecorations } from './RainbowDecorations';
import { HomeContent } from './HomeContent';

export function HomePage() {
  const { particles, stars } = useParticles();

  return (
    <main
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 bg-drift"
      style={{ backgroundSize: '400% 400%' }}
    >
      <FairyBackground />
      <HomeHeader />
      <FloatingParticles particles={particles} stars={stars} />
      <RainbowDecorations />
      <HomeContent />
      <OnboardingTour autoStart />
    </main>
  );
}
