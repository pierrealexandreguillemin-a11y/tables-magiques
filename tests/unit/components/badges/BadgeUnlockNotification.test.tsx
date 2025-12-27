/**
 * Tests Unitaires - BadgeUnlockNotification
 * ISO/IEC 29119 - TDD notification deblocage badge
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeUnlockNotification } from '@/features/badges/components/BadgeUnlockNotification';
import type { BadgeDefinition } from '@/types/badge';

const mockBadge: BadgeDefinition = {
  id: 'first',
  emoji: '⭐',
  name: 'Premiere Etoile',
  description: 'Premiere reponse correcte',
  mode: 'practice',
  condition: '1 bonne reponse',
};

describe('BadgeUnlockNotification', () => {
  describe('Affichage', () => {
    it('affiche emoji du badge', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('affiche nom du badge', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(screen.getByText('Premiere Etoile')).toBeInTheDocument();
    });

    it('affiche message de felicitation', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(screen.getByText(/nouveau badge/i)).toBeInTheDocument();
    });

    it('affiche description du badge', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(screen.getByText('Premiere reponse correcte')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('appelle onClose sur clic bouton', () => {
      const onClose = vi.fn();
      render(<BadgeUnlockNotification badge={mockBadge} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Accessibilite', () => {
    it('a role dialog', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      expect(
        screen.getByRole('dialog', { name: /nouveau badge/i })
      ).toBeInTheDocument();
    });

    it('bouton continuer a focus par defaut', () => {
      render(<BadgeUnlockNotification badge={mockBadge} onClose={vi.fn()} />);

      const button = screen.getByRole('button', { name: /continuer/i });
      expect(button).toHaveFocus();
    });
  });

  describe('Badges multiples', () => {
    const multipleBadges: BadgeDefinition[] = [
      mockBadge,
      {
        id: 'streak5',
        emoji: '🦄',
        name: 'Licorne Magique',
        description: '5 bonnes reponses',
        mode: 'practice',
        condition: '5 bonnes reponses',
      },
    ];

    it('affiche nombre de badges gagnes', () => {
      render(
        <BadgeUnlockNotification badges={multipleBadges} onClose={vi.fn()} />
      );

      expect(screen.getByText(/2.*badges/i)).toBeInTheDocument();
    });

    it('affiche tous les emojis', () => {
      render(
        <BadgeUnlockNotification badges={multipleBadges} onClose={vi.fn()} />
      );

      expect(screen.getByText('⭐')).toBeInTheDocument();
      expect(screen.getByText('🦄')).toBeInTheDocument();
    });
  });
});
