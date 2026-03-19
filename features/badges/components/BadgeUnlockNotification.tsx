/**
 * BadgeUnlockNotification - Modal celebration deblocage badge
 * ISO/IEC 25010 - UI component
 */

'use client';

import { useEffect, useRef } from 'react';
import type { BadgeDefinition } from '@/types/badge';

export interface BadgeUnlockNotificationProps {
  badge?: BadgeDefinition;
  badges?: BadgeDefinition[];
  onClose: () => void;
}

export function BadgeUnlockNotification({
  badge,
  badges,
  onClose,
}: BadgeUnlockNotificationProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allBadges = badges || (badge ? [badge] : []);
  const isMultiple = allBadges.length > 1;

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  if (allBadges.length === 0) return null;

  // TypeScript type guard - après le check length === 0, on sait que [0] existe
  const firstBadge = allBadges[0]!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-label="Nouveau badge debloque"
      aria-modal="true"
    >
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-2xl max-w-sm mx-4 animate-fade-scale">
        <div
          className="animate-celebration-entry"
          style={{ '--delay': '0.2s' } as React.CSSProperties}
        >
          {isMultiple ? (
            <div className="flex justify-center gap-2 text-6xl mb-4">
              {allBadges.map((b) => (
                <span key={b.id}>{b.emoji}</span>
              ))}
            </div>
          ) : (
            <span className="text-8xl block mb-4">{firstBadge.emoji}</span>
          )}
        </div>

        <h2
          className="text-2xl font-bold mb-2 animate-fade-up"
          style={{ '--delay': '0.4s' } as React.CSSProperties}
        >
          {isMultiple
            ? `${allBadges.length} nouveaux badges!`
            : 'Nouveau badge!'}
        </h2>

        {!isMultiple && (
          <>
            <p
              className="text-xl font-semibold mb-1 animate-fade-up"
              style={{ '--delay': '0.5s' } as React.CSSProperties}
            >
              {firstBadge.name}
            </p>

            <p
              className="text-white/80 animate-fade-up"
              style={{ '--delay': '0.6s' } as React.CSSProperties}
            >
              {firstBadge.description}
            </p>
          </>
        )}

        {isMultiple && (
          <div
            className="space-y-1 mb-2 animate-fade-up"
            style={{ '--delay': '0.5s' } as React.CSSProperties}
          >
            {allBadges.map((b) => (
              <p key={b.id} className="text-sm">
                <span className="font-semibold">{b.name}</span>
              </p>
            ))}
          </div>
        )}

        <button
          ref={buttonRef}
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-purple-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/50 animate-fade-up interactive-scale"
          style={{ '--delay': '0.7s' } as React.CSSProperties}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
