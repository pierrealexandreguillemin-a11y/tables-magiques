/**
 * BadgeCollection - Grille de badges
 * ISO/IEC 25010 - UI component
 */

'use client';

import { BadgeCard } from './BadgeCard';
import { ScrollRevealList } from '@/components/effects/ScrollReveal';
import { PRACTICE_BADGES, CHALLENGE_BADGES } from '@/types/badge';
import type { EarnedBadge } from '@/types/badge';
import type { GameMode } from '@/types/game';

export interface BadgeCollectionProps {
  earnedBadges: EarnedBadge[];
  mode: GameMode | 'all';
}

export function BadgeCollection({ earnedBadges, mode }: BadgeCollectionProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  const getEarnedAt = (badgeId: string): string | undefined => {
    return earnedBadges.find((b) => b.id === badgeId)?.earnedAt;
  };

  const practiceBadges = PRACTICE_BADGES;
  const challengeBadges = CHALLENGE_BADGES;

  const practiceEarnedCount = practiceBadges.filter((b) =>
    earnedIds.has(b.id)
  ).length;
  const challengeEarnedCount = challengeBadges.filter((b) =>
    earnedIds.has(b.id)
  ).length;

  const showPractice = mode === 'practice' || mode === 'all';
  const showChallenge = mode === 'challenge' || mode === 'all';

  return (
    <div role="region" aria-label="Collection de badges" className="space-y-8">
      {showPractice && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-purple-800">
              Badges Entraînement
            </h2>
            <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {practiceEarnedCount} / {practiceBadges.length}
            </span>
          </div>

          <ScrollRevealList
            variant="fade-up"
            staggerDelay={0.1}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {practiceBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedIds.has(badge.id)}
                earnedAt={getEarnedAt(badge.id)}
              />
            ))}
          </ScrollRevealList>
        </section>
      )}

      {showChallenge && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-orange-800">
              Badges Challenge
            </h2>
            <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              {challengeEarnedCount} / {challengeBadges.length}
            </span>
          </div>

          <ScrollRevealList
            variant="fade-up"
            staggerDelay={0.1}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {challengeBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedIds.has(badge.id)}
                earnedAt={getEarnedAt(badge.id)}
              />
            ))}
          </ScrollRevealList>
        </section>
      )}
    </div>
  );
}
