/**
 * BadgeCard - Composant badge individuel
 * ISO/IEC 25010 - UI component
 */

'use client';

import type { BadgeDefinition } from '@/types/badge';
import { BadgeIcon, type BadgeId } from '@/components/effects/BadgeIcon';
import { cn } from '@/lib/utils';

export interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeConfig = {
  small: {
    container: 'p-2',
    iconSize: 32,
    name: 'text-xs',
    description: 'text-xs',
  },
  medium: {
    container: 'p-4',
    iconSize: 48,
    name: 'text-sm',
    description: 'text-xs',
  },
  large: {
    container: 'p-6',
    iconSize: 72,
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
  const config = sizeConfig[size];
  const statusLabel = earned ? 'gagne' : 'non gagne';

  return (
    <article
      role="article"
      aria-label={`Badge ${badge.name} - ${statusLabel}`}
      className={cn(
        'flex flex-col items-center text-center rounded-xl bg-white/80 shadow-sm transition-transform hover:scale-105',
        config.container,
        !earned && 'opacity-50'
      )}
    >
      <div className="mb-2">
        <BadgeIcon
          badgeId={badge.id as BadgeId}
          size={config.iconSize}
          locked={!earned}
          animate={earned}
        />
      </div>

      <h3 className={cn(config.name, 'font-semibold text-gray-800')}>
        {badge.name}
      </h3>

      <p className={cn(config.description, 'text-gray-600 mt-1')}>
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
