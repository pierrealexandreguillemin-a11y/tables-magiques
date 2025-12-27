/**
 * Tests Unitaires - useChallenge Hook
 * ISO/IEC 29119 - TDD: Tests hook React
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChallenge } from '@/features/game/hooks/useChallenge';

describe('useChallenge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial state', () => {
    it('initialise en phase ready', () => {
      const { result } = renderHook(() => useChallenge());

      expect(result.current.isReady).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isGameOver).toBe(false);
    });

    it('userAnswer initial vide', () => {
      const { result } = renderHook(() => useChallenge());

      expect(result.current.userAnswer).toBe('');
    });

    it('result initial null', () => {
      const { result } = renderHook(() => useChallenge());

      expect(result.current.result).toBeNull();
    });

    it('canSubmit false initialement', () => {
      const { result } = renderHook(() => useChallenge());

      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe('start', () => {
    it('passe en phase playing', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.isReady).toBe(false);
    });

    it('genere une question', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      expect(result.current.state.currentQuestion).not.toBeNull();
    });

    it('initialise timer global a 180', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      expect(result.current.state.globalTimeRemaining).toBe(180);
    });
  });

  describe('appendDigit / deleteDigit', () => {
    it('appendDigit ajoute un chiffre', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.appendDigit(5);
      });

      expect(result.current.userAnswer).toBe('5');
    });

    it('appendDigit multiple chiffres', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.appendDigit(5);
        result.current.appendDigit(6);
      });

      expect(result.current.userAnswer).toBe('56');
    });

    it('appendDigit max 3 chiffres', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.appendDigit(1);
        result.current.appendDigit(2);
        result.current.appendDigit(3);
        result.current.appendDigit(4); // Ignore
      });

      expect(result.current.userAnswer).toBe('123');
    });

    it('deleteDigit supprime dernier chiffre', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.appendDigit(5);
        result.current.appendDigit(6);
        result.current.deleteDigit();
      });

      expect(result.current.userAnswer).toBe('5');
    });

    it('canSubmit true apres saisie', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.appendDigit(5);
      });

      expect(result.current.canSubmit).toBe(true);
    });
  });

  describe('answerQuestion', () => {
    it('reset userAnswer apres reponse', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.appendDigit(5);
      });

      act(() => {
        result.current.answerQuestion();
      });

      expect(result.current.userAnswer).toBe('');
    });

    it('incremente questionsAnswered', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.appendDigit(5);
      });

      act(() => {
        result.current.answerQuestion();
      });

      expect(result.current.state.questionsAnswered).toBe(1);
    });

    it('ne fait rien si userAnswer vide', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
        result.current.answerQuestion(); // No answer
      });

      expect(result.current.state.questionsAnswered).toBe(0);
    });
  });

  describe('replay', () => {
    it('reset a etat initial', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
        result.current.appendDigit(5);
        result.current.replay();
      });

      expect(result.current.isReady).toBe(true);
      expect(result.current.userAnswer).toBe('');
      expect(result.current.result).toBeNull();
    });
  });

  describe('Timer effect', () => {
    it('decremente timer global chaque seconde', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      expect(result.current.state.globalTimeRemaining).toBe(180);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state.globalTimeRemaining).toBe(179);
    });

    it('decremente timer question chaque seconde', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      expect(result.current.state.questionTimeRemaining).toBe(5);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state.questionTimeRemaining).toBe(4);
    });

    it('auto-skip apres 5 secondes', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.state.questionsAnswered).toBe(1);
      expect(result.current.state.questionTimeRemaining).toBe(5); // Reset
    });

    it('game over apres 180 secondes', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(result.current.isGameOver).toBe(true);
      expect(result.current.result).not.toBeNull();
    });

    it('calcule result a game over', () => {
      const { result } = renderHook(() => useChallenge());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(result.current.result).toHaveProperty('totalScore');
      expect(result.current.result).toHaveProperty('accuracy');
    });
  });

  describe('Config personnalisee', () => {
    it('accepte globalTime personnalise', () => {
      const { result } = renderHook(() => useChallenge({ globalTime: 60 }));

      act(() => {
        result.current.start();
      });

      expect(result.current.state.globalTimeRemaining).toBe(60);
    });

    it('accepte questionTime personnalise', () => {
      const { result } = renderHook(() => useChallenge({ questionTime: 3 }));

      act(() => {
        result.current.start();
      });

      expect(result.current.state.questionTimeRemaining).toBe(3);
    });
  });
});
