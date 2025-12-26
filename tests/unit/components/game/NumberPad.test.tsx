/**
 * Tests Unitaires - NumberPad
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberPad } from '@/components/game/NumberPad';

describe('NumberPad', () => {
  describe('Rendu des boutons', () => {
    it('affiche les chiffres 0-9', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      for (let i = 0; i <= 9; i++) {
        expect(
          screen.getByRole('button', { name: String(i) })
        ).toBeInTheDocument();
      }
    });

    it('affiche bouton effacer', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /effacer/i })
      ).toBeInTheDocument();
    });

    it('affiche bouton valider', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /valider/i })
      ).toBeInTheDocument();
    });
  });

  describe('Callbacks sur clic', () => {
    it('appelle onNumberClick avec le bon chiffre', () => {
      const onNumberClick = vi.fn();
      render(
        <NumberPad
          onNumberClick={onNumberClick}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '5' }));

      expect(onNumberClick).toHaveBeenCalledWith(5);
    });

    it('appelle onNumberClick pour chaque chiffre', () => {
      const onNumberClick = vi.fn();
      render(
        <NumberPad
          onNumberClick={onNumberClick}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      for (let i = 0; i <= 9; i++) {
        fireEvent.click(screen.getByRole('button', { name: String(i) }));
        expect(onNumberClick).toHaveBeenLastCalledWith(i);
      }

      expect(onNumberClick).toHaveBeenCalledTimes(10);
    });

    it('appelle onClear sur clic effacer', () => {
      const onClear = vi.fn();
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={onClear}
          onSubmit={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /effacer/i }));

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('appelle onSubmit sur clic valider', () => {
      const onSubmit = vi.fn();
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={onSubmit}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /valider/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Etat disabled', () => {
    it('desactive tous les boutons quand disabled=true', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
          disabled={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('boutons actifs par defaut', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('ne declenche pas callback si disabled', () => {
      const onNumberClick = vi.fn();
      render(
        <NumberPad
          onNumberClick={onNumberClick}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '5' }));

      expect(onNumberClick).not.toHaveBeenCalled();
    });
  });

  describe('Bouton valider conditionnel', () => {
    it('desactive valider si canSubmit=false', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
          canSubmit={false}
        />
      );

      expect(screen.getByRole('button', { name: /valider/i })).toBeDisabled();
    });

    it('active valider si canSubmit=true', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
          canSubmit={true}
        />
      );

      expect(
        screen.getByRole('button', { name: /valider/i })
      ).not.toBeDisabled();
    });

    it('valider actif par defaut', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /valider/i })
      ).not.toBeDisabled();
    });
  });

  describe('Accessibilite', () => {
    it('a role group pour le clavier', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/clavier/i)).toBeInTheDocument();
    });

    it('boutons ont aria-label si icone', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /effacer/i })
      ).toHaveAccessibleName();
      expect(
        screen.getByRole('button', { name: /valider/i })
      ).toHaveAccessibleName();
    });
  });

  describe('Layout grille', () => {
    it('organise les boutons en grille 3 colonnes', () => {
      render(
        <NumberPad
          onNumberClick={vi.fn()}
          onClear={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const grid = screen.getByRole('group');
      expect(grid).toHaveClass('grid-cols-3');
    });
  });
});
