/**
 * Tests integration Onboarding
 * ISO 29119 - Tests contre production
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { useFirstVisit } from '@/features/onboarding/hooks/useFirstVisit';
import { TourTooltip } from '@/features/onboarding/components/TourTooltip';
import { MAIN_TOUR_STEPS } from '@/types/onboarding';

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
// TEST COMPONENTS
// =============================================================================

function TestOnboardingIntegration() {
  const { isFirstVisit, hasTourCompleted, markTourCompleted } = useFirstVisit();
  const { state, steps, currentStep, start, next, prev, skip, complete } =
    useOnboarding({
      onComplete: markTourCompleted,
    });

  return (
    <div>
      <div data-testid="first-visit">{isFirstVisit ? 'yes' : 'no'}</div>
      <div data-testid="tour-completed">{hasTourCompleted ? 'yes' : 'no'}</div>
      <div data-testid="tour-active">{state.isActive ? 'yes' : 'no'}</div>
      <div data-testid="current-step">{state.currentStep}</div>

      <button data-testid="start-tour" onClick={start}>
        Start
      </button>
      <button data-testid="next-step" onClick={next}>
        Next
      </button>
      <button data-testid="prev-step" onClick={prev}>
        Prev
      </button>
      <button data-testid="skip-tour" onClick={skip}>
        Skip
      </button>
      <button data-testid="complete-tour" onClick={complete}>
        Complete
      </button>

      {currentStep && (
        <TourTooltip
          title={currentStep.title}
          content={currentStep.content}
          currentIndex={state.currentStep}
          totalSteps={steps.length}
          canGoPrev={state.currentStep > 0}
          canGoNext={state.currentStep < steps.length - 1}
          canSkip={state.canSkip}
          isLast={state.currentStep === steps.length - 1}
          onPrev={prev}
          onNext={next}
          onSkip={skip}
          onComplete={complete}
        />
      )}
    </div>
  );
}

// =============================================================================
// TESTS
// =============================================================================

describe('Onboarding Integration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('First Visit Detection', () => {
    it('detects first visit correctly', () => {
      render(<TestOnboardingIntegration />);

      expect(screen.getByTestId('first-visit')).toHaveTextContent('yes');
    });

    it('detects returning visit after localStorage set', async () => {
      mockLocalStorage.setItem('tables-magiques-first-visit', 'true');

      render(<TestOnboardingIntegration />);

      await waitFor(() => {
        expect(screen.getByTestId('first-visit')).toHaveTextContent('no');
      });
    });
  });

  describe('Tour Navigation', () => {
    it('navigates through all steps', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      // Start tour
      await user.click(screen.getByTestId('start-tour'));
      expect(screen.getByTestId('tour-active')).toHaveTextContent('yes');
      expect(screen.getByTestId('current-step')).toHaveTextContent('0');

      // Navigate to step 1
      await user.click(screen.getByTestId('next-step'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');

      // Navigate to step 2
      await user.click(screen.getByTestId('next-step'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // Go back to step 1
      await user.click(screen.getByTestId('prev-step'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });

    it('shows correct step content', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));

      // Should show first step content
      const firstStep = MAIN_TOUR_STEPS[0];
      const secondStep = MAIN_TOUR_STEPS[1];
      expect(firstStep).toBeDefined();
      expect(secondStep).toBeDefined();

      expect(screen.getByText(firstStep!.title)).toBeInTheDocument();
      expect(screen.getByText(firstStep!.content)).toBeInTheDocument();

      // Navigate to next step
      await user.click(screen.getByTestId('next-step'));

      // Should show second step content
      expect(screen.getByText(secondStep!.title)).toBeInTheDocument();
    });
  });

  describe('Tour Completion', () => {
    it('marks tour as completed on completion', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));
      expect(screen.getByTestId('tour-completed')).toHaveTextContent('no');

      await user.click(screen.getByTestId('complete-tour'));
      expect(screen.getByTestId('tour-completed')).toHaveTextContent('yes');
    });

    it('persists completion state', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));
      await user.click(screen.getByTestId('complete-tour'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tables-magiques-tour-completed',
        'true'
      );
    });
  });

  describe('Skip Functionality', () => {
    it('closes tour on skip', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));
      expect(screen.getByTestId('tour-active')).toHaveTextContent('yes');

      await user.click(screen.getByTestId('skip-tour'));
      expect(screen.getByTestId('tour-active')).toHaveTextContent('no');
    });
  });

  describe('Tooltip Integration', () => {
    it('shows tooltip with navigation controls', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));

      // Tooltip should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Progress dots should be visible
      expect(screen.getAllByRole('tab')).toHaveLength(MAIN_TOUR_STEPS.length);

      // Close button should be visible
      expect(screen.getByLabelText('Fermer le guide')).toBeInTheDocument();
    });

    it('navigates via tooltip buttons', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('0');

      // Click next in tooltip
      await user.click(screen.getByLabelText('Etape suivante'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');

      // Click prev in tooltip
      await user.click(screen.getByLabelText('Etape precedente'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    });

    it('closes via tooltip close button', async () => {
      const user = userEvent.setup();
      render(<TestOnboardingIntegration />);

      await user.click(screen.getByTestId('start-tour'));
      expect(screen.getByTestId('tour-active')).toHaveTextContent('yes');

      await user.click(screen.getByLabelText('Fermer le guide'));
      expect(screen.getByTestId('tour-active')).toHaveTextContent('no');
    });
  });
});
