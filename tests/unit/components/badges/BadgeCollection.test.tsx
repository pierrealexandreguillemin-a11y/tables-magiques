/**
 * Tests Unitaires - BadgeCollection
 * ISO/IEC 29119 - TDD grille de badges
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeCollection } from '@/features/badges/components/BadgeCollection';
import { PRACTICE_BADGES, CHALLENGE_BADGES } from '@/types/badge';

// Mock useReducedMotion pour desactiver les animations (ScrollRevealList)
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({ shouldAnimate: false }),
}));

const mockEarnedBadges = [
  { id: 'first', mode: 'practice' as const, earnedAt: '2024-01-15T10:00:00Z' },
  {
    id: 'streak5',
    mode: 'practice' as const,
    earnedAt: '2024-01-16T11:00:00Z',
  },
  {
    id: 'speed5',
    mode: 'challenge' as const,
    earnedAt: '2024-01-17T12:00:00Z',
  },
];

describe('BadgeCollection', () => {
  describe('Affichage general', () => {
    it('affiche titre badges practice', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      expect(screen.getByText(/practice/i)).toBeInTheDocument();
    });

    it('affiche titre badges challenge', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="challenge" />
      );

      expect(screen.getByText('Badges Challenge')).toBeInTheDocument();
    });

    it('affiche tous les badges practice', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      expect(screen.getAllByRole('article')).toHaveLength(
        PRACTICE_BADGES.length
      );
    });

    it('affiche tous les badges challenge', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="challenge" />
      );

      expect(screen.getAllByRole('article')).toHaveLength(
        CHALLENGE_BADGES.length
      );
    });
  });

  describe('Badges gagnes vs non gagnes', () => {
    it('marque les badges gagnes', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      // first et streak5 sont gagnes
      const articles = screen.getAllByRole('article');
      const firstBadge = articles.find((a) =>
        a.getAttribute('aria-label')?.includes('Premiere Etoile')
      );
      expect(firstBadge?.getAttribute('aria-label')).toContain('gagne');
    });

    it('marque les badges non gagnes', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      // streak50 n'est pas gagne
      const articles = screen.getAllByRole('article');
      const streak50 = articles.find((a) =>
        a.getAttribute('aria-label')?.includes('Super Championne')
      );
      expect(streak50?.getAttribute('aria-label')).toContain('non gagne');
    });
  });

  describe('Compteur', () => {
    it('affiche compteur badges gagnes practice', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      // 2 badges practice gagnes sur 8
      expect(screen.getByText(/2.*\/.*8/)).toBeInTheDocument();
    });

    it('affiche compteur badges gagnes challenge', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="challenge" />
      );

      // 1 badge challenge gagne sur 5
      expect(screen.getByText(/1.*\/.*5/)).toBeInTheDocument();
    });
  });

  describe('Accessibilite', () => {
    it('a role region', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('a heading de niveau 2', () => {
      render(
        <BadgeCollection earnedBadges={mockEarnedBadges} mode="practice" />
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Mode affichage', () => {
    it('affiche les deux modes avec all', () => {
      render(<BadgeCollection earnedBadges={mockEarnedBadges} mode="all" />);

      const totalBadges = PRACTICE_BADGES.length + CHALLENGE_BADGES.length;
      expect(screen.getAllByRole('article')).toHaveLength(totalBadges);
    });
  });
});
