/**
 * Integration Tests - Challenge Page
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 *
 * Mode Challenge: 3 minutes total, 5 secondes par question
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock GSAP avec vi.hoisted pour accès dans les mocks
const { mockGsap, mockUseGSAP } = vi.hoisted(() => {
  const mockGsap = {
    to: vi.fn().mockReturnValue({ kill: vi.fn() }),
    from: vi.fn().mockReturnValue({ kill: vi.fn() }),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
    registerPlugin: vi.fn(),
    defaults: vi.fn(),
    ticker: { lagSmoothing: vi.fn(), fps: vi.fn() },
    context: vi.fn(() => ({ revert: vi.fn(), add: vi.fn() })),
  };
  const mockUseGSAP = vi.fn((cb?: () => void) => {
    if (typeof cb === 'function')
      try {
        cb();
      } catch {}
    return {
      context: { revert: vi.fn() },
      contextSafe: vi.fn((fn: unknown) => fn),
    };
  });
  return { mockGsap, mockUseGSAP };
});

vi.mock('gsap', () => ({ gsap: mockGsap, default: mockGsap }));

vi.mock('@/lib/animations/gsap/register', () => ({
  gsap: mockGsap,
  useGSAP: mockUseGSAP,
}));

vi.mock('@gsap/react', () => ({ useGSAP: mockUseGSAP }));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock framer-motion - filtre les props motion pour éviter warnings React
vi.mock('framer-motion', () => {
  const filterMotionProps = (props: Record<string, unknown>) => {
    const motionProps = [
      'whileHover',
      'whileTap',
      'animate',
      'initial',
      'exit',
      'transition',
      'variants',
    ];
    return Object.fromEntries(
      Object.entries(props).filter(([key]) => !motionProps.includes(key))
    );
  };

  return {
    motion: {
      div: ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => <div {...filterMotionProps(props)}>{children}</div>,
      button: ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => <button {...filterMotionProps(props)}>{children}</button>,
      span: ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => <span {...filterMotionProps(props)}>{children}</span>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useAnimationControls: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
    useTransform: () => ({ get: () => 0, on: () => vi.fn() }),
  };
});

// Mock useTheme for ThemeToggle
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    isDark: false,
    systemPreference: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

// Mock ToastProvider hooks
vi.mock('@/components/effects/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToastContext: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
    toasts: [],
  }),
}));

// Mock useAnnouncer
vi.mock('@/hooks/useAnnouncer', () => ({
  useAnnouncer: () => ({
    announcePolite: vi.fn(),
    announceAssertive: vi.fn(),
  }),
}));

// Mock useReducedMotion pour TextReveal
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({ shouldAnimate: false }),
}));

import ChallengePage from '@/app/challenge/page';

describe('Challenge Page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Phase Ready', () => {
    it('affiche titre Mode Challenge', () => {
      render(<ChallengePage />);

      expect(screen.getByText(/mode challenge/i)).toBeInTheDocument();
    });

    it('affiche bouton demarrer', () => {
      render(<ChallengePage />);

      expect(
        screen.getByRole('button', { name: /commencer/i })
      ).toBeInTheDocument();
    });

    it('affiche instructions 3 minutes', () => {
      render(<ChallengePage />);

      expect(screen.getByText(/3.*minutes/i)).toBeInTheDocument();
    });

    it('affiche instructions 5 secondes par question', () => {
      render(<ChallengePage />);

      expect(screen.getByText(/5.*secondes/i)).toBeInTheDocument();
    });

    it('affiche lien retour accueil', () => {
      render(<ChallengePage />);

      expect(screen.getByRole('link', { name: /retour/i })).toHaveAttribute(
        'href',
        '/'
      );
    });
  });

  describe('Phase Playing', () => {
    it('demarre le jeu sur clic commencer', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // Timer global visible
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('affiche timer global 3:00', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('affiche barre timer question', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('affiche une question', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // QuestionDisplay avec role region et aria-label specifique
      expect(
        screen.getByLabelText(/question.*multiplication/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/×/)).toBeInTheDocument();
    });

    it('affiche NumberPad', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('decremente timer global chaque seconde', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByText('3:00')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('2:59')).toBeInTheDocument();
    });

    it('decremente timer question chaque seconde', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(progressbar).toHaveAttribute('aria-valuenow', '4');
    });
  });

  describe('Reponses', () => {
    it('permet de saisir une reponse', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      fireEvent.click(screen.getByRole('button', { name: '5' }));
      fireEvent.click(screen.getByRole('button', { name: '6' }));

      expect(screen.getByText('56')).toBeInTheDocument();
    });

    it('passe a question suivante apres validation', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // Repondre avec un chiffre et valider
      fireEvent.click(screen.getByRole('button', { name: '5' }));
      fireEvent.click(screen.getByRole('button', { name: /valider/i }));

      // Attendre le feedback
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Progressbar reset a 5
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
    });

    it('affiche score apres reponse', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // Le score doit etre visible
      expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    });
  });

  describe('Auto-skip question', () => {
    it('passe a question suivante apres 5 secondes', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // Attendre 5 secondes
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Timer question reset
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('Game Over', () => {
    it('termine apres 3 minutes', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      // Attendre 3 minutes
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      // Ecran game over
      expect(screen.getByText(/termin/i)).toBeInTheDocument();
    });

    it('affiche score final', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      // Le score total est affiche en points
      expect(screen.getByText(/points/i)).toBeInTheDocument();
    });

    it('affiche bouton rejouer', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(
        screen.getByRole('button', { name: /rejouer/i })
      ).toBeInTheDocument();
    });

    it('permet de rejouer', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      fireEvent.click(screen.getByRole('button', { name: /rejouer/i }));

      // Retour a l'ecran ready
      expect(
        screen.getByRole('button', { name: /commencer/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibilite', () => {
    it('page a titre accessible', () => {
      render(<ChallengePage />);

      expect(
        screen.getByRole('heading', { name: /challenge/i })
      ).toBeInTheDocument();
    });

    it('timers ont role timer', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('progressbar a aria-label', () => {
      render(<ChallengePage />);

      fireEvent.click(screen.getByRole('button', { name: /commencer/i }));

      expect(screen.getByRole('progressbar')).toHaveAccessibleName();
    });
  });
});
