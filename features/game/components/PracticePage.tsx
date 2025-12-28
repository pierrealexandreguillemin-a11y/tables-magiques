/**
 * PracticePage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only (<50 lines)
 */

'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  LazyFairyBackground,
  LazySuccessExplosion,
  preloadHeavyComponents,
} from '@/lib/animations';
import { AuthGate } from '@/features/auth';
import { usePractice } from '../hooks/usePractice';
import { usePracticeUI } from '../hooks/usePracticeUI';
import {
  PracticeHeader,
  PracticeSelection,
  PracticePlaying,
  PracticeCompleted,
} from './practice';

gsap.registerPlugin(useGSAP);

export function PracticePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    state,
    currentQuestion,
    result,
    startGame,
    handleNumberClick,
    handleClear,
    handleSubmit,
    handleBack,
    canSubmit,
    isPlaying,
    isSelection,
    isCompleted,
    progress,
  } = usePractice();
  const { explosionVisible, isGuestMode, enableGuestMode } = usePracticeUI({
    showFeedback: state.showFeedback,
    isCorrect: state.isCorrect,
    score: state.score,
    streak: state.streak,
    isCompleted,
    result,
  });

  useEffect(() => {
    preloadHeavyComponents();
  }, []);

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
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
    >
      <LazyFairyBackground />
      <LazySuccessExplosion show={explosionVisible} type="confetti" size="lg" />
      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
        <PracticeHeader
          isPlaying={isPlaying}
          score={state.score}
          currentIndex={state.currentIndex}
          streak={state.streak}
        />
        <AnimatePresence mode="wait">
          {isSelection && <PracticeSelection onSelectTable={startGame} />}
          {isPlaying && currentQuestion && (
            <PracticePlaying
              state={state}
              question={currentQuestion}
              progress={progress}
              canSubmit={canSubmit}
              onBack={handleBack}
              onNumber={handleNumberClick}
              onClear={handleClear}
              onSubmit={handleSubmit}
            />
          )}
          {isCompleted && result && (
            <PracticeCompleted
              result={result}
              selectedTable={state.selectedTable}
              onBack={handleBack}
              onReplay={() => startGame(state.selectedTable)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isGuestMode) return content;
  return (
    <AuthGate
      message="Connecte-toi pour sauvegarder tes scores ! 🦄"
      onGuestMode={enableGuestMode}
    >
      {content}
    </AuthGate>
  );
}
