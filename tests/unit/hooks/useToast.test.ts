/**
 * Tests useToast - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * WCAG 2.2 - Toast Notifications (6s minimum, pause on hover)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('creation de toast', () => {
    it('retourne un tableau vide initialement', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('ajoute un toast avec toast()', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message test');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]?.message).toBe('Message test');
    });

    it('retourne l ID du toast cree', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.toast('Message');
      });

      expect(toastId).toBeTruthy();
      expect(result.current.toasts[0]?.id).toBe(toastId);
    });

    it('utilise le type info par defaut', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message');
      });

      expect(result.current.toasts[0]?.type).toBe('info');
    });

    it('permet de specifier un type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message', { type: 'error' });
      });

      expect(result.current.toasts[0]?.type).toBe('error');
    });
  });

  describe('shortcuts par type', () => {
    it('success() cree un toast success', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Bravo!');
      });

      expect(result.current.toasts[0]?.type).toBe('success');
      expect(result.current.toasts[0]?.message).toBe('Bravo!');
    });

    it('star() cree un toast star', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.star('Etoile gagnee!');
      });

      expect(result.current.toasts[0]?.type).toBe('star');
    });

    it('crown() cree un toast crown', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.crown('Couronne obtenue!');
      });

      expect(result.current.toasts[0]?.type).toBe('crown');
    });

    it('error() cree un toast error', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Oups!');
      });

      expect(result.current.toasts[0]?.type).toBe('error');
    });
  });

  describe('duree WCAG 2.2', () => {
    it('utilise 6000ms par defaut (WCAG 2.2.1)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message');
      });

      expect(result.current.toasts[0]?.duration).toBe(6000);
    });

    it('permet une duree personnalisee', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message', { duration: 8000 });
      });

      expect(result.current.toasts[0]?.duration).toBe(8000);
    });

    it('supprime automatiquement apres la duree', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message', { duration: 6000 });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('dismiss', () => {
    it('supprime un toast par ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.toast('Message');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('dismissAll supprime tous les toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message 1');
        result.current.toast('Message 2');
        result.current.toast('Message 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.dismissAll();
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('limite de toasts', () => {
    it('limite a 3 toasts maximum', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Message 1');
        result.current.toast('Message 2');
        result.current.toast('Message 3');
        result.current.toast('Message 4');
      });

      expect(result.current.toasts).toHaveLength(3);
      // Le plus ancien est supprime
      expect(result.current.toasts[0]?.message).toBe('Message 2');
    });
  });

  describe('icones par defaut', () => {
    it('attribue une icone selon le type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Test');
      });

      expect(result.current.toasts[0]?.icon).toBeTruthy();
    });

    it('permet une icone personnalisee', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast('Test', { icon: '🎉' });
      });

      expect(result.current.toasts[0]?.icon).toBe('🎉');
    });
  });
});
