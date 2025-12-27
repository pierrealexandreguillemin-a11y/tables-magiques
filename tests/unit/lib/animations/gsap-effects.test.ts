/**
 * Tests Unitaires - GSAP Effects
 * ISO/IEC 29119 - TDD: Tests animations GSAP
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock GSAP avec vi.hoisted pour accès aux fonctions mockées
const { mockTo, mockFrom, mockTimeline, mockGsap } = vi.hoisted(() => {
  const mockTo = vi.fn().mockReturnValue({ kill: vi.fn() });
  const mockFrom = vi.fn();
  const mockTimeline = vi.fn().mockReturnValue({
    to: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
  });
  const mockGsap = {
    to: mockTo,
    from: mockFrom,
    timeline: mockTimeline,
    registerPlugin: vi.fn(),
    defaults: vi.fn(),
    ticker: {
      lagSmoothing: vi.fn(),
      fps: vi.fn(),
    },
  };
  return { mockTo, mockFrom, mockTimeline, mockGsap };
});

// Mock @gsap/react pour useGSAP
vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn(),
}));

// Mock gsap complet incluant registerPlugin et defaults
vi.mock('gsap', () => ({
  gsap: mockGsap,
  default: mockGsap,
}));

// Import apres mock
import {
  confettiExplosion,
  fireworksDisplay,
  magneticHover,
  animateScore,
  shakeError,
  badgeUnlock,
  timerPulse,
  staggerReveal,
  pageTransition,
  numberWave,
  celebrationCascade,
  glowPulse,
} from '@/lib/animations/gsap/effects';

describe('GSAP Effects', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  describe('confettiExplosion', () => {
    it('cree des particules de confetti', () => {
      confettiExplosion(container, { count: 5 });

      expect(container.children.length).toBe(5);
      expect(mockTo).toHaveBeenCalledTimes(5);
    });

    it('utilise 50 particules par defaut', () => {
      confettiExplosion(container);

      expect(container.children.length).toBe(50);
    });
  });

  describe('fireworksDisplay', () => {
    it('cree plusieurs feux artifice avec setTimeout', () => {
      fireworksDisplay(container);

      // Premier feu immediat (setTimeout(fn, 0))
      vi.advanceTimersByTime(0);
      expect(container.children.length).toBeGreaterThan(0);

      // Avancer le temps pour les autres feux
      vi.advanceTimersByTime(1500);
      expect(mockTo).toHaveBeenCalled();
    });
  });

  describe('magneticHover', () => {
    it('ajoute listeners mousemove et mouseleave', () => {
      const element = document.createElement('div');
      const addEventSpy = vi.spyOn(element, 'addEventListener');

      magneticHover(element);

      expect(addEventSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
      expect(addEventSpy).toHaveBeenCalledWith(
        'mouseleave',
        expect.any(Function)
      );
    });

    it('retourne fonction de cleanup', () => {
      const element = document.createElement('div');
      const removeEventSpy = vi.spyOn(element, 'removeEventListener');

      const cleanup = magneticHover(element);
      cleanup();

      expect(removeEventSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('animateScore', () => {
    it('anime le score de from a to', () => {
      const element = document.createElement('div');

      animateScore(element, { from: 0, to: 100 });

      expect(mockTo).toHaveBeenCalledWith(
        { value: 0 },
        expect.objectContaining({
          value: 100,
          duration: 1.5,
        })
      );
    });
  });

  describe('shakeError', () => {
    it('cree une timeline de shake', () => {
      const element = document.createElement('div');

      shakeError(element);

      expect(mockTimeline).toHaveBeenCalled();
    });
  });

  describe('badgeUnlock', () => {
    it("anime l'apparition du badge", () => {
      const element = document.createElement('div');

      badgeUnlock(element);

      // badgeUnlock utilise gsap.timeline() puis tl.from()
      expect(mockTimeline).toHaveBeenCalled();
    });
  });

  describe('timerPulse', () => {
    it('retourne une animation pulsante', () => {
      const element = document.createElement('div');

      const result = timerPulse(element);

      expect(mockTo).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          scale: 1.1,
          color: '#ff4444',
          repeat: -1,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('staggerReveal', () => {
    it("anime une liste d'elements avec stagger", () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
      ];

      staggerReveal(elements);

      expect(mockFrom).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: 0.1,
          y: 50,
          opacity: 0,
        })
      );
    });
  });

  describe('pageTransition', () => {
    it('enter anime depuis le bas', () => {
      const element = document.createElement('div');

      pageTransition.enter(element);

      expect(mockFrom).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          opacity: 0,
          y: 50,
        })
      );
    });

    it('exit anime vers le haut avec callback', () => {
      const element = document.createElement('div');
      const onComplete = vi.fn();

      pageTransition.exit(element, onComplete);

      expect(mockTo).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          opacity: 0,
          y: -50,
          onComplete,
        })
      );
    });
  });

  describe('numberWave', () => {
    it('anime les elements avec rotation', () => {
      const elements = [document.createElement('div')];

      numberWave(elements);

      expect(mockFrom).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          scale: 0,
          rotation: -90,
          stagger: 0.05,
        })
      );
    });
  });

  describe('celebrationCascade', () => {
    it('cree des emojis qui tombent avec setTimeout', () => {
      celebrationCascade(container);

      // Premier emoji avec setTimeout(fn, 0)
      vi.advanceTimersByTime(0);
      expect(container.children.length).toBeGreaterThan(0);

      // Avancer le temps pour plus d'emojis
      vi.advanceTimersByTime(3000);
      expect(mockTo).toHaveBeenCalled();
    });
  });

  describe('glowPulse', () => {
    it('cree animation glow avec couleur par defaut', () => {
      const element = document.createElement('div');

      glowPulse(element);

      expect(mockTo).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          repeat: -1,
          yoyo: true,
        })
      );
    });

    it('accepte couleur personnalisee', () => {
      const element = document.createElement('div');

      glowPulse(element, { color: '#00ff00' });

      expect(mockTo).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          boxShadow: expect.stringContaining('#00ff00'),
        })
      );
    });
  });
});
