/**
 * Tests unitaires OnboardingTour
 * ISO 29119 - Tests contre production
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TourProgress } from '@/features/onboarding/components/TourProgress';
import { TourTooltip } from '@/features/onboarding/components/TourTooltip';

// =============================================================================
// MOCK LOCALSTORAGE
// =============================================================================

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// =============================================================================
// TOUR PROGRESS TESTS
// =============================================================================

describe('TourProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correct number of dots', () => {
      render(<TourProgress total={5} current={0} />);

      const buttons = screen.getAllByRole('tab');
      expect(buttons).toHaveLength(5);
    });

    it('marks current step as selected', () => {
      render(<TourProgress total={5} current={2} />);

      const buttons = screen.getAllByRole('tab');
      expect(buttons[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('marks other steps as not selected', () => {
      render(<TourProgress total={5} current={2} />);

      const buttons = screen.getAllByRole('tab');
      expect(buttons[0]).toHaveAttribute('aria-selected', 'false');
      expect(buttons[1]).toHaveAttribute('aria-selected', 'false');
      expect(buttons[3]).toHaveAttribute('aria-selected', 'false');
      expect(buttons[4]).toHaveAttribute('aria-selected', 'false');
    });

    it('has correct aria-label for each step', () => {
      render(<TourProgress total={3} current={0} />);

      expect(screen.getByLabelText('Etape 1 sur 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Etape 2 sur 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Etape 3 sur 3')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onStepClick when provided', async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();

      render(<TourProgress total={5} current={0} onStepClick={onStepClick} />);

      const buttons = screen.getAllByRole('tab');
      const thirdButton = buttons[2];
      expect(thirdButton).toBeDefined();
      await user.click(thirdButton!);

      expect(onStepClick).toHaveBeenCalledWith(2);
    });

    it('does not call onStepClick when not provided', async () => {
      const user = userEvent.setup();

      render(<TourProgress total={5} current={0} />);

      const buttons = screen.getAllByRole('tab');
      const thirdButton = buttons[2];
      expect(thirdButton).toBeDefined();
      // Should not throw
      await user.click(thirdButton!);
    });
  });

  describe('Accessibility', () => {
    it('has tablist role', () => {
      render(<TourProgress total={3} current={0} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has aria-label on container', () => {
      render(<TourProgress total={3} current={0} />);

      expect(
        screen.getByRole('tablist', { name: /progression/i })
      ).toBeInTheDocument();
    });
  });
});

// =============================================================================
// TOUR TOOLTIP TESTS
// =============================================================================

describe('TourTooltip', () => {
  const defaultProps = {
    title: 'Test Title',
    content: 'Test content description',
    currentIndex: 0,
    totalSteps: 5,
    canGoPrev: false,
    canGoNext: true,
    canSkip: true,
    isLast: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders title', () => {
      render(<TourTooltip {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders content', () => {
      render(<TourTooltip {...defaultProps} />);

      expect(screen.getByText('Test content description')).toBeInTheDocument();
    });

    it('renders progress dots', () => {
      render(<TourTooltip {...defaultProps} />);

      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('renders close button when canSkip', () => {
      render(<TourTooltip {...defaultProps} canSkip={true} />);

      expect(screen.getByLabelText('Fermer le guide')).toBeInTheDocument();
    });

    it('hides close button when canSkip=false', () => {
      render(<TourTooltip {...defaultProps} canSkip={false} />);

      expect(
        screen.queryByLabelText('Fermer le guide')
      ).not.toBeInTheDocument();
    });
  });

  describe('Navigation buttons', () => {
    it('shows next button when canGoNext and not last', () => {
      render(<TourTooltip {...defaultProps} canGoNext={true} isLast={false} />);

      expect(screen.getByLabelText('Etape suivante')).toBeInTheDocument();
    });

    it('shows prev button when canGoPrev', () => {
      render(<TourTooltip {...defaultProps} canGoPrev={true} />);

      expect(screen.getByLabelText('Etape precedente')).toBeInTheDocument();
    });

    it('hides prev button when canGoPrev=false', () => {
      render(<TourTooltip {...defaultProps} canGoPrev={false} />);

      expect(
        screen.queryByLabelText('Etape precedente')
      ).not.toBeInTheDocument();
    });

    it('shows finish button on last step', () => {
      render(<TourTooltip {...defaultProps} isLast={true} />);

      expect(screen.getByLabelText('Terminer le guide')).toBeInTheDocument();
      expect(screen.getByText('Terminer')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onNext when next clicked', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();

      render(<TourTooltip {...defaultProps} onNext={onNext} />);

      await user.click(screen.getByLabelText('Etape suivante'));

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPrev when prev clicked', async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();

      render(
        <TourTooltip {...defaultProps} canGoPrev={true} onPrev={onPrev} />
      );

      await user.click(screen.getByLabelText('Etape precedente'));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });

    it('calls onSkip when close clicked', async () => {
      const user = userEvent.setup();
      const onSkip = vi.fn();

      render(<TourTooltip {...defaultProps} onSkip={onSkip} />);

      await user.click(screen.getByLabelText('Fermer le guide'));

      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('calls onComplete when finish clicked', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();

      render(
        <TourTooltip {...defaultProps} isLast={true} onComplete={onComplete} />
      );

      await user.click(screen.getByLabelText('Terminer le guide'));

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(<TourTooltip {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-labelledby for title', () => {
      render(<TourTooltip {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'tour-title');
    });

    it('has aria-describedby for content', () => {
      render(<TourTooltip {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'tour-content');
    });
  });
});
