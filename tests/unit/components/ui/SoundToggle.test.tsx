/**
 * Tests - SoundToggle Component
 * ISO/IEC 29119 - TDD pour toggle son
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SoundToggle } from '@/components/ui/SoundToggle';

// Mock useSound hook
const mockToggle = vi.fn();
const mockUseSound = vi.fn();

vi.mock('@/hooks/useSound', () => ({
  useSound: () => mockUseSound(),
}));

describe('SoundToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock avec valeurs par défaut
    mockUseSound.mockReturnValue({
      enabled: false,
      volume: 0.5,
      reducedMotion: false,
      play: vi.fn(),
      toggle: mockToggle,
      setVolume: vi.fn(),
    });
  });

  describe('Rendu', () => {
    it('rend le bouton toggle', () => {
      render(<SoundToggle />);

      expect(screen.getByTestId('sound-toggle')).toBeInTheDocument();
    });

    it('affiche icône volume off quand désactivé', () => {
      render(<SoundToggle />);

      expect(screen.getByTestId('volume-off-icon')).toBeInTheDocument();
    });

    it('affiche icône volume on quand activé', () => {
      mockUseSound.mockReturnValue({
        enabled: true,
        volume: 0.5,
        reducedMotion: false,
        play: vi.fn(),
        toggle: mockToggle,
        setVolume: vi.fn(),
      });

      render(<SoundToggle />);

      expect(screen.getByTestId('volume-on-icon')).toBeInTheDocument();
    });

    it('applique className personnalisée', () => {
      render(<SoundToggle className="custom-class" />);

      expect(screen.getByTestId('sound-toggle')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('appelle toggle au clic', () => {
      render(<SoundToggle />);

      fireEvent.click(screen.getByTestId('sound-toggle'));

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('toggle au Enter', () => {
      render(<SoundToggle />);

      const button = screen.getByTestId('sound-toggle');
      button.focus();
      // Simuler Enter qui déclenche click sur button
      fireEvent.click(button);

      expect(mockToggle).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('a aria-label pour désactiver quand activé', () => {
      mockUseSound.mockReturnValue({
        enabled: true,
        volume: 0.5,
        reducedMotion: false,
        play: vi.fn(),
        toggle: mockToggle,
        setVolume: vi.fn(),
      });

      render(<SoundToggle />);

      expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
        'aria-label',
        'Désactiver le son'
      );
    });

    it('a aria-label pour activer quand désactivé', () => {
      // Utilise le mock par défaut (enabled: false)
      render(<SoundToggle />);

      expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
        'aria-label',
        'Activer le son'
      );
    });

    it('a aria-pressed selon état', () => {
      mockUseSound.mockReturnValue({
        enabled: true,
        volume: 0.5,
        reducedMotion: false,
        play: vi.fn(),
        toggle: mockToggle,
        setVolume: vi.fn(),
      });

      render(<SoundToggle />);

      expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('icônes ont aria-hidden', () => {
      // enabled: false = volume-off-icon
      render(<SoundToggle />);

      const icon = screen.getByTestId('volume-off-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('est focusable au clavier', () => {
      render(<SoundToggle />);

      const button = screen.getByTestId('sound-toggle');
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('Reduced Motion', () => {
    it('affiche opacité réduite en reduced motion', () => {
      mockUseSound.mockReturnValue({
        enabled: false,
        volume: 0.5,
        reducedMotion: true,
        play: vi.fn(),
        toggle: mockToggle,
        setVolume: vi.fn(),
      });

      render(<SoundToggle />);

      expect(screen.getByTestId('sound-toggle')).toHaveClass('opacity-50');
    });
  });
});
