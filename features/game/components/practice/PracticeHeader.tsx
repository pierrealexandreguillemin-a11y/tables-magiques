/**
 * PracticeHeader
 * ISO/IEC 25010 - SRP: Header only
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallButton } from '@/components/pwa/InstallButton';
import { ScoreBoard } from '../ScoreBoard';

interface Props {
  isPlaying: boolean;
  score: number;
  currentIndex: number;
  streak: number;
}

export function PracticeHeader({
  isPlaying,
  score,
  currentIndex,
  streak,
}: Props) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <InstallButton />
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
          <ScoreBoard score={score} total={currentIndex + 1} streak={streak} />
        )}
      </div>
    </>
  );
}
