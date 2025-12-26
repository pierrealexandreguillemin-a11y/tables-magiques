/**
 * BadgeCard - Composant badge individuel
 * ISO/IEC 25010 - UI component
 */

'use client';

import type { BadgeDefinition } from '@/types/badge';
import { cn } from '@/lib/utils';

export interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: {
    container: 'p-2',
    emoji: 'text-2xl',
    name: 'text-xs',
    description: 'text-xs',
  },
  medium: {
    container: 'p-4',
    emoji: 'text-4xl',
    name: 'text-sm',
    description: 'text-xs',
  },
  large: {
    container: 'p-6',
    emoji: 'text-6xl',
    name: 'text-base',
    description: 'text-sm',
  },
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function BadgeCard({
  badge,
  earned,
  earnedAt,
  size = 'medium',
}: BadgeCardProps) {
  const classes = sizeClasses[size];
  const statusLabel = earned ? 'gagne' : 'non gagne';

  return (
    <article
      role="article"
      aria-label={`Badge ${badge.name} - ${statusLabel}`}
      className={cn(
        'flex flex-col items-center text-center rounded-xl bg-white/80 shadow-sm transition-transform hover:scale-105',
        classes.container,
        !earned && 'opacity-50'
      )}
    >
      <span
        className={cn(classes.emoji, 'mb-2', !earned && 'grayscale')}
        aria-hidden="true"
      >
        {badge.emoji}
      </span>

      <h3 className={cn(classes.name, 'font-semibold text-gray-800')}>
        {badge.name}
      </h3>

      <p className={cn(classes.description, 'text-gray-600 mt-1')}>
        {earned ? badge.description : badge.condition}
      </p>

      {earned && earnedAt && (
        <span className="text-xs text-purple-600 mt-2">
          {formatDate(earnedAt)}
        </span>
      )}
    </article>
  );
}
