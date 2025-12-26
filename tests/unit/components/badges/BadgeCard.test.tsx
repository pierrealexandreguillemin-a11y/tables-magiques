/**
 * Tests Unitaires - BadgeCard
 * ISO/IEC 29119 - TDD composant badge individuel
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeCard } from '@/features/badges/components/BadgeCard';
import type { BadgeDefinition } from '@/types/badge';

const mockBadge: BadgeDefinition = {
  id: 'first',
  emoji: '⭐',
  name: 'Premiere Etoile',
  description: 'Premiere reponse correcte',
  mode: 'practice',
  condition: '1 bonne reponse',
};

describe('BadgeCard', () => {
  describe('Badge gagne', () => {
    it('affiche emoji du badge', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('affiche nom du badge', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(screen.getByText('Premiere Etoile')).toBeInTheDocument();
    });

    it('affiche description du badge', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(screen.getByText('Premiere reponse correcte')).toBeInTheDocument();
    });

    it('a opacity complete quand gagne', () => {
      const { container } = render(
        <BadgeCard badge={mockBadge} earned={true} />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('opacity-50');
    });

    it('affiche date si fournie', () => {
      render(
        <BadgeCard
          badge={mockBadge}
          earned={true}
          earnedAt="2024-01-15T10:30:00Z"
        />
      );

      expect(screen.getByText(/15/)).toBeInTheDocument();
    });
  });

  describe('Badge non gagne', () => {
    it('affiche emoji en gris', () => {
      render(<BadgeCard badge={mockBadge} earned={false} />);

      const emoji = screen.getByText('⭐');
      expect(emoji).toHaveClass('grayscale');
    });

    it('a opacity reduite', () => {
      const { container } = render(
        <BadgeCard badge={mockBadge} earned={false} />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('opacity-50');
    });

    it('affiche condition au lieu de description', () => {
      render(<BadgeCard badge={mockBadge} earned={false} />);

      expect(screen.getByText('1 bonne reponse')).toBeInTheDocument();
    });
  });

  describe('Accessibilite', () => {
    it('a role article', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(
        screen.getByRole('article', { name: /Premiere Etoile/i })
      ).toBeInTheDocument();
    });

    it('indique statut gagne dans aria-label', () => {
      render(<BadgeCard badge={mockBadge} earned={true} />);

      expect(
        screen.getByRole('article', { name: /gagne/i })
      ).toBeInTheDocument();
    });

    it('indique statut non gagne dans aria-label', () => {
      render(<BadgeCard badge={mockBadge} earned={false} />);

      expect(
        screen.getByRole('article', { name: /non gagne/i })
      ).toBeInTheDocument();
    });
  });

  describe('Taille', () => {
    it('supporte taille small', () => {
      const { container } = render(
        <BadgeCard badge={mockBadge} earned={true} size="small" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-2');
    });

    it('supporte taille medium par defaut', () => {
      const { container } = render(
        <BadgeCard badge={mockBadge} earned={true} />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('supporte taille large', () => {
      const { container } = render(
        <BadgeCard badge={mockBadge} earned={true} size="large" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });
});
