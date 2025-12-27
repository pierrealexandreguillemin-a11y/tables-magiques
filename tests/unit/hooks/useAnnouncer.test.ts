/**
 * Tests useAnnouncer - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * WCAG 2.2 - Screen Reader Announcements (aria-live)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnouncer, cleanupLiveRegions } from '@/hooks/useAnnouncer';

describe('useAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clean DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanupLiveRegions();
  });

  describe('creation de regions aria-live', () => {
    it('cree une region polite au premier announce', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Test message');
        vi.advanceTimersByTime(16); // RAF
      });

      const region = document.getElementById('announcer-polite');
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('role', 'status');
    });

    it('cree une region assertive au premier announce assertive', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announceAssertive('Urgent message');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-assertive');
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-live', 'assertive');
      expect(region).toHaveAttribute('role', 'alert');
    });

    it('reutilise la region existante', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Message 1');
        vi.advanceTimersByTime(16);
      });

      act(() => {
        result.current.announcePolite('Message 2');
        vi.advanceTimersByTime(16);
      });

      const regions = document.querySelectorAll('#announcer-polite');
      expect(regions).toHaveLength(1);
    });
  });

  describe('annonces', () => {
    it('announcePolite met le message dans la region', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Score: 10 points');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region?.textContent).toBe('Score: 10 points');
    });

    it('announceAssertive met le message dans la region', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announceAssertive('Erreur!');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-assertive');
      expect(region?.textContent).toBe('Erreur!');
    });

    it('announce() utilise polite par defaut', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Message');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region?.textContent).toBe('Message');
    });

    it('announce() peut specifier assertive', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Urgent', 'assertive');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-assertive');
      expect(region?.textContent).toBe('Urgent');
    });
  });

  describe('accessibilite visuelle', () => {
    it('la region est visuellement cachee', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Test');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region?.style.position).toBe('absolute');
      expect(region?.style.width).toBe('1px');
      expect(region?.style.height).toBe('1px');
      expect(region?.style.overflow).toBe('hidden');
    });

    it('a aria-atomic true', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Test');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('cleanup', () => {
    it('vide le message apres timeout', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Message temporaire');
        vi.advanceTimersByTime(16);
      });

      expect(document.getElementById('announcer-polite')?.textContent).toBe(
        'Message temporaire'
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(document.getElementById('announcer-polite')?.textContent).toBe('');
    });

    it('cleanupLiveRegions supprime les regions', () => {
      const { result } = renderHook(() => useAnnouncer());

      // Creer region polite
      act(() => {
        result.current.announcePolite('Test polite');
        vi.advanceTimersByTime(16);
      });

      // Attendre le debounce avant de creer assertive
      act(() => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        result.current.announceAssertive('Test assertive');
        vi.advanceTimersByTime(16);
      });

      // Verifier que les regions existent
      expect(document.getElementById('announcer-polite')).toBeTruthy();
      expect(document.getElementById('announcer-assertive')).toBeTruthy();

      cleanupLiveRegions();

      expect(document.getElementById('announcer-polite')).toBeNull();
      expect(document.getElementById('announcer-assertive')).toBeNull();
    });
  });

  describe('debounce', () => {
    it('ignore les messages trop rapproches', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Message 1');
        result.current.announcePolite('Message 2'); // Ignored
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region?.textContent).toBe('Message 1');
    });

    it('accepte les messages apres le debounce delay', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('Message 1');
        vi.advanceTimersByTime(16);
      });

      act(() => {
        vi.advanceTimersByTime(150); // Debounce delay
      });

      act(() => {
        result.current.announcePolite('Message 2');
        vi.advanceTimersByTime(16);
      });

      const region = document.getElementById('announcer-polite');
      expect(region?.textContent).toBe('Message 2');
    });
  });

  describe('messages vides', () => {
    it('ignore les messages vides', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('');
        vi.advanceTimersByTime(16);
      });

      expect(
        document.getElementById('announcer-polite')
      ).not.toBeInTheDocument();
    });

    it('ignore les messages whitespace only', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announcePolite('   ');
        vi.advanceTimersByTime(16);
      });

      expect(
        document.getElementById('announcer-polite')
      ).not.toBeInTheDocument();
    });
  });
});
