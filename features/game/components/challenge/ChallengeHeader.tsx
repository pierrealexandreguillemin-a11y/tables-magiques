/**
 * ChallengeHeader
 * ISO/IEC 25010 - SRP: Header only
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import { GlobalTimer } from '../GlobalTimer';
import { ScoreBoard } from '../ScoreBoard';

interface Props {
  isPlaying: boolean;
  timeRemaining: number;
  score: number;
  questionsAnswered: number;
  streak: number;
}

export function ChallengeHeader({
  isPlaying,
  timeRemaining,
  score,
  questionsAnswered,
  streak,
}: Props) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <InstallButton />
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            aria-label="Retour accueil"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </Link>

        {isPlaying && (
          <div className="flex items-center gap-4">
            <GlobalTimer timeRemaining={timeRemaining} />
            <ScoreBoard
              score={score}
              total={questionsAnswered}
              streak={streak}
            />
          </div>
        )}
      </div>
    </>
  );
}
