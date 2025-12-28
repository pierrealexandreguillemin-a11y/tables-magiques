/**
 * ChallengePage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only (<50 lines)
 */

'use client';

import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  LazyParticlesBackground,
  LazySuccessExplosion,
} from '@/lib/animations';
import { AuthGate } from '@/features/auth';
import { useChallenge } from '../hooks/useChallenge';
import { useChallengeUI } from '../hooks/useChallengeUI';
import {
  ChallengeHeader,
  ChallengeReady,
  ChallengePlaying,
  ChallengeGameOver,
} from './challenge';

gsap.registerPlugin(useGSAP);

export function ChallengePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    state,
    userAnswer,
    result,
    start,
    answerQuestion,
    appendDigit,
    deleteDigit,
    replay,
    canSubmit,
    isPlaying,
    isReady,
    isGameOver,
  } = useChallenge();
  const { feedback, isGuestMode, enableGuestMode } = useChallengeUI({
    questionsAnswered: state.questionsAnswered,
    score: state.score,
    streak: state.streak,
    isPlaying,
    isGameOver,
    result,
  });

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.to(containerRef.current, {
        backgroundPosition: '200% 50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: containerRef }
  );

  const content = (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-red-400 to-blue-400 dark:from-slate-900 dark:via-red-900 dark:to-indigo-900"
      style={{ backgroundSize: '400% 400%' }}
    >
      <LazyParticlesBackground preset="sparkles" opacity={0.6} />
      <LazySuccessExplosion
        show={feedback.explosion}
        type="fireworks"
        size="lg"
      />
      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
        <ChallengeHeader
          isPlaying={isPlaying}
          timeRemaining={state.globalTimeRemaining}
          score={state.score}
          questionsAnswered={state.questionsAnswered}
          streak={state.streak}
        />
        <AnimatePresence mode="wait">
          {isReady && <ChallengeReady onStart={start} />}
          {isPlaying && state.currentQuestion && (
            <ChallengePlaying
              question={state.currentQuestion}
              userAnswer={userAnswer}
              timeRemaining={state.questionTimeRemaining}
              maxTime={state.config.questionTime}
              streak={state.streak}
              feedback={feedback}
              canSubmit={canSubmit}
              onDigit={appendDigit}
              onDelete={deleteDigit}
              onSubmit={answerQuestion}
            />
          )}
          {isGameOver && result && (
            <ChallengeGameOver result={result} onReplay={replay} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isGuestMode) return content;
  return (
    <AuthGate
      message="Connecte-toi pour sauvegarder tes scores de challenge ! 🔥"
      onGuestMode={enableGuestMode}
    >
      {content}
    </AuthGate>
  );
}
