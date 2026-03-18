/**
 * Tests batch-d — GsapCelebration, SuccessExplosion, LottieAnimation,
 *                  ToastProvider / useToastContext, AccessibilitySection
 * ISO/IEC 29119 - Tests unitaires
 */

import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Shared mocks — declared before any component import
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => {
  const tags = ['div', 'section', 'span', 'button', 'path'];
  const motion: Record<
    string,
    React.FC<React.HTMLAttributes<HTMLElement> & Record<string, unknown>>
  > = {};

  tags.forEach((tag) => {
    motion[tag] = ({
      children,
      animate: _a,
      initial: _i,
      exit: _e,
      transition: _t,
      variants: _v,
      whileTap: _wt,
      whileHover: _wh,
      layout: _l,
      layoutId: _lid,
      ...rest
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(
        tag,
        rest as React.HTMLAttributes<HTMLElement>,
        children
      );
  });

  return {
    motion,
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => (
      <>{children}</>
    ),
  };
});

const mockConfettiExplosion = vi.fn();
const mockFireworksDisplay = vi.fn(() => vi.fn());
const mockCelebrationCascade = vi.fn(() => vi.fn());

vi.mock('@/hooks/useGsapEffects', () => ({
  useGsapEffects: () => ({
    confettiExplosion: mockConfettiExplosion,
    fireworksDisplay: mockFireworksDisplay,
    celebrationCascade: mockCelebrationCascade,
  }),
}));

const mockReducedMotionState = {
  shouldAnimate: true,
  prefersReducedMotion: false,
};

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotionState,
}));

vi.mock('lottie-react', () => ({
  default: ({
    animationData: _ad,
    autoplay: _ap,
    loop: _l,
    lottieRef: _ref,
    rendererSettings: _rs,
    style,
  }: Record<string, unknown>) =>
    React.createElement('div', {
      'data-testid': 'lottie-player',
      style: style as React.CSSProperties,
    }),
}));

vi.mock('@/lib/animations', () => ({
  getAnimationData: (_id: string) => ({ v: '5.0.0', layers: [] }),
  getAnimationFallback: (id: string) => {
    const map: Record<string, string> = {
      success: '✅',
      error: '💭',
      loading: '✨',
      celebration: '🎉',
      streak: '🔥',
      crown: '👑',
      sparkles: '✨',
    };
    return map[id] ?? '✨';
  },
}));

// AnimatedCheckbox stub used by SettingsToggle
vi.mock('@/components/effects/AnimatedCheckbox', () => ({
  AnimatedCheckbox: ({
    checked,
    onChange,
    disabled,
    'aria-label': ariaLabel,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      data-testid="animated-checkbox"
    />
  ),
}));

// Toast mock used by ToastProvider (ToastContainer)
vi.mock('@/components/effects/Toast', () => ({
  ToastContainer: ({
    toasts,
    onDismiss,
    position,
  }: {
    toasts: { id: string; message: string; type: string }[];
    onDismiss: (id: string) => void;
    position?: string;
  }) => (
    <div data-testid="toast-container" data-position={position}>
      {toasts.map((t) => (
        <div key={t.id} data-testid={`toast-${t.id}`} data-type={t.type}>
          {t.message}
          <button onClick={() => onDismiss(t.id)} aria-label="dismiss">
            x
          </button>
        </div>
      ))}
    </div>
  ),
}));

// useToast used by ToastProvider
vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockUseToastReturn,
}));

// ---------------------------------------------------------------------------
// Mutable mock return for useToast — mutated per test
// ---------------------------------------------------------------------------

const mockDismiss = vi.fn();
const mockDismissAll = vi.fn();
const mockToast = vi.fn(() => 'toast-id-1');
const mockSuccess = vi.fn(() => 'toast-id-2');
const mockStar = vi.fn(() => 'toast-id-3');
const mockCrown = vi.fn(() => 'toast-id-4');
const mockError = vi.fn(() => 'toast-id-5');

let mockUseToastReturn = {
  toasts: [] as { id: string; message: string; type: string }[],
  toast: mockToast,
  success: mockSuccess,
  star: mockStar,
  crown: mockCrown,
  error: mockError,
  dismiss: mockDismiss,
  dismissAll: mockDismissAll,
};

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------

import { GsapCelebration } from '@/components/effects/GsapCelebration';
import { SuccessExplosion } from '@/components/effects/SuccessExplosion';
import { LottieAnimation } from '@/components/effects/LottieAnimation';
import {
  ToastProvider,
  useToastContext,
} from '@/components/effects/ToastProvider';
import { AccessibilitySection } from '@/features/settings/components/sections/AccessibilitySection';

// ---------------------------------------------------------------------------
// 1. GsapCelebration
// ---------------------------------------------------------------------------

describe('GsapCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockConfettiExplosion.mockClear();
    mockFireworksDisplay.mockClear();
    mockCelebrationCascade.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rend le wrapper avec data-testid', () => {
    render(<GsapCelebration type="confetti" trigger={false} />);
    expect(screen.getByTestId('gsap-celebration')).toBeInTheDocument();
  });

  it('expose le type via data-celebration-type', () => {
    render(<GsapCelebration type="fireworks" trigger={false} />);
    expect(screen.getByTestId('gsap-celebration')).toHaveAttribute(
      'data-celebration-type',
      'fireworks'
    );
  });

  it('rend les children', () => {
    render(
      <GsapCelebration type="confetti" trigger={false}>
        <span>Enfant</span>
      </GsapCelebration>
    );
    expect(screen.getByText('Enfant')).toBeInTheDocument();
  });

  it('applique className', () => {
    const { container } = render(
      <GsapCelebration type="none" trigger={false} className="test-class" />
    );
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('ne declenche pas confetti quand trigger=false', () => {
    render(<GsapCelebration type="confetti" trigger={false} />);
    expect(mockConfettiExplosion).not.toHaveBeenCalled();
  });

  it('declenche confettiExplosion quand trigger=true et type=confetti', () => {
    render(<GsapCelebration type="confetti" trigger={true} />);
    expect(mockConfettiExplosion).toHaveBeenCalledOnce();
  });

  it('passe particleCount a confettiExplosion', () => {
    render(
      <GsapCelebration type="confetti" trigger={true} particleCount={80} />
    );
    expect(mockConfettiExplosion).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      { count: 80 }
    );
  });

  it('declenche fireworksDisplay quand type=fireworks', () => {
    render(<GsapCelebration type="fireworks" trigger={true} />);
    expect(mockFireworksDisplay).toHaveBeenCalledOnce();
  });

  it('declenche celebrationCascade quand type=cascade', () => {
    render(<GsapCelebration type="cascade" trigger={true} />);
    expect(mockCelebrationCascade).toHaveBeenCalledOnce();
  });

  it('appelle onComplete apres timeout confetti (1500ms)', () => {
    const onComplete = vi.fn();
    render(
      <GsapCelebration type="confetti" trigger={true} onComplete={onComplete} />
    );
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1500));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('appelle onComplete apres timeout fireworks (2000ms)', () => {
    const onComplete = vi.fn();
    render(
      <GsapCelebration
        type="fireworks"
        trigger={true}
        onComplete={onComplete}
      />
    );
    act(() => vi.advanceTimersByTime(1999));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('appelle onComplete immediatement quand type=none et trigger=true', () => {
    const onComplete = vi.fn();
    render(
      <GsapCelebration type="none" trigger={true} onComplete={onComplete} />
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('ne declenche rien quand disableAnimation=true', () => {
    render(
      <GsapCelebration type="confetti" trigger={true} disableAnimation={true} />
    );
    expect(mockConfettiExplosion).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 2. SuccessExplosion
// ---------------------------------------------------------------------------

describe('SuccessExplosion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockConfettiExplosion.mockClear();
    mockFireworksDisplay.mockClear();
    mockCelebrationCascade.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('ne rend rien quand show=false', () => {
    const { container } = render(<SuccessExplosion show={false} />);
    // AnimatePresence passthrough but show=false means no inner content
    expect(container.querySelector('[data-testid="lottie-player"]')).toBeNull();
  });

  it('rend le lottie player quand show=true', () => {
    render(<SuccessExplosion show={true} />);
    expect(screen.getByTestId('lottie-player')).toBeInTheDocument();
  });

  it('applique className quand show=true', () => {
    const { container } = render(
      <SuccessExplosion show={true} className="custom-explosion" />
    );
    const el = container.querySelector('.custom-explosion');
    expect(el).not.toBeNull();
  });

  it('declenche confettiExplosion par defaut (type=confetti)', () => {
    render(<SuccessExplosion show={true} />);
    expect(mockConfettiExplosion).toHaveBeenCalledOnce();
  });

  it('declenche fireworksDisplay quand type=fireworks', () => {
    render(<SuccessExplosion show={true} type="fireworks" />);
    expect(mockFireworksDisplay).toHaveBeenCalledOnce();
  });

  it('declenche celebrationCascade quand type=celebration', () => {
    render(<SuccessExplosion show={true} type="celebration" />);
    expect(mockCelebrationCascade).toHaveBeenCalledOnce();
  });

  it('appelle onComplete apres 2500ms', () => {
    const onComplete = vi.fn();
    render(<SuccessExplosion show={true} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2500));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('passe count=100 a confetti pour size=lg', () => {
    render(<SuccessExplosion show={true} size="lg" />);
    expect(mockConfettiExplosion).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { count: 100 }
    );
  });

  it('passe count=50 a confetti pour size=sm', () => {
    render(<SuccessExplosion show={true} size="sm" />);
    expect(mockConfettiExplosion).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { count: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// 3. LottieAnimation
// ---------------------------------------------------------------------------

describe('LottieAnimation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rend sans crash', () => {
    const { container } = render(<LottieAnimation type="success" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('rend le lottie-player quand shouldAnimate=true', () => {
    render(<LottieAnimation type="celebration" />);
    expect(screen.getByTestId('lottie-player')).toBeInTheDocument();
  });

  it('applique la taille via style', () => {
    const { container } = render(<LottieAnimation type="success" size={120} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('120px');
    expect(wrapper.style.height).toBe('120px');
  });

  it('a role=img et aria-label', () => {
    render(<LottieAnimation type="success" />);
    const el = screen.getByRole('img');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Animation success');
  });

  it('applique className', () => {
    const { container } = render(
      <LottieAnimation type="loading" className="my-lottie" />
    );
    expect(container.querySelector('.my-lottie')).not.toBeNull();
  });

  it('affiche emoji fallback quand shouldAnimate=false', () => {
    mockReducedMotionState.shouldAnimate = false;
    mockReducedMotionState.prefersReducedMotion = true;

    render(<LottieAnimation type="celebration" size={80} />);
    expect(screen.queryByTestId('lottie-player')).toBeNull();
    // Fallback emoji container
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Animation celebration'
    );

    // restore
    mockReducedMotionState.shouldAnimate = true;
    mockReducedMotionState.prefersReducedMotion = false;
  });

  it('fallback a la bonne taille de police (size * 0.6)', () => {
    mockReducedMotionState.shouldAnimate = false;
    mockReducedMotionState.prefersReducedMotion = true;

    render(<LottieAnimation type="success" size={100} />);
    const span = screen.getByRole('img').querySelector('span') as HTMLElement;
    expect(span.style.fontSize).toBe('60px');

    // restore
    mockReducedMotionState.shouldAnimate = true;
    mockReducedMotionState.prefersReducedMotion = false;
  });

  it('accepte loop=true sans crash', () => {
    render(<LottieAnimation type="loading" loop={true} />);
    expect(screen.getByTestId('lottie-player')).toBeInTheDocument();
  });

  it('accepte autoplay=false sans crash', () => {
    render(<LottieAnimation type="success" autoplay={false} />);
    expect(screen.getByTestId('lottie-player')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 4. ToastProvider / useToastContext
// ---------------------------------------------------------------------------

describe('ToastProvider', () => {
  beforeEach(() => {
    mockUseToastReturn = {
      toasts: [],
      toast: mockToast,
      success: mockSuccess,
      star: mockStar,
      crown: mockCrown,
      error: mockError,
      dismiss: mockDismiss,
      dismissAll: mockDismissAll,
    };
  });

  afterEach(() => vi.restoreAllMocks());

  it('rend les children', () => {
    render(
      <ToastProvider>
        <span>Contenu</span>
      </ToastProvider>
    );
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('rend le ToastContainer', () => {
    render(
      <ToastProvider>
        <span>App</span>
      </ToastProvider>
    );
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('passe la position au ToastContainer (defaut top-right)', () => {
    render(
      <ToastProvider>
        <span>App</span>
      </ToastProvider>
    );
    expect(screen.getByTestId('toast-container')).toHaveAttribute(
      'data-position',
      'top-right'
    );
  });

  it('passe la position personnalisee', () => {
    render(
      <ToastProvider position="bottom-center">
        <span>App</span>
      </ToastProvider>
    );
    expect(screen.getByTestId('toast-container')).toHaveAttribute(
      'data-position',
      'bottom-center'
    );
  });

  it('affiche les toasts provenant de useToast', () => {
    mockUseToastReturn = {
      ...mockUseToastReturn,
      toasts: [{ id: 'abc', message: 'Bravo!', type: 'success' }],
    };
    render(
      <ToastProvider>
        <span>App</span>
      </ToastProvider>
    );
    expect(screen.getByText('Bravo!')).toBeInTheDocument();
  });

  it('passe onDismiss au ToastContainer', () => {
    mockUseToastReturn = {
      ...mockUseToastReturn,
      toasts: [{ id: 'xyz', message: 'Salut', type: 'info' }],
    };
    render(
      <ToastProvider>
        <span>App</span>
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'dismiss' }));
    expect(mockDismiss).toHaveBeenCalledWith('xyz');
  });
});

/* eslint-disable react-hooks/globals */
describe('useToastContext', () => {
  afterEach(() => vi.restoreAllMocks());

  it('expose les fonctions depuis le contexte', () => {
    let ctx!: ReturnType<typeof useToastContext>;

    function Consumer() {
      ctx = useToastContext();
      return null;
    }

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    expect(ctx).toBeDefined();
    expect(typeof ctx!.toast).toBe('function');
    expect(typeof ctx!.success).toBe('function');
    expect(typeof ctx!.dismiss).toBe('function');
  });

  it('lance une erreur si utilise hors du provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function BadConsumer() {
      useToastContext();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'useToastContext must be used within a ToastProvider'
    );

    spy.mockRestore();
  });

  it('appelle toast via le contexte', () => {
    let ctx!: ReturnType<typeof useToastContext>;

    function Consumer() {
      ctx = useToastContext();
      return null;
    }

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    ctx!.toast('Message test');
    expect(mockToast).toHaveBeenCalledWith('Message test');
  });

  it('appelle success via le contexte', () => {
    let ctx!: ReturnType<typeof useToastContext>;

    function Consumer() {
      ctx = useToastContext();
      return null;
    }

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    ctx!.success('Super!');
    expect(mockSuccess).toHaveBeenCalledWith('Super!');
  });
});

// ---------------------------------------------------------------------------
// 5. AccessibilitySection
// ---------------------------------------------------------------------------

const defaultSettings = {
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    textScale: 1.0,
    screenReaderOptimized: false,
    animationSpeed: 1.0,
  },
  audio: {
    soundEnabled: false,
    soundVolume: 0.5,
    musicEnabled: false,
    musicVolume: 0.3,
  },
  display: {
    theme: 'system' as const,
    accentColor: 'pink' as const,
    density: 'normal' as const,
  },
  game: {
    difficulty: 'normal' as const,
    timePerQuestion: 10,
    questionsPerSession: 10,
    favoriteTables: [],
    showHints: true,
  },
  notifications: {
    dailyReminders: false,
    reminderTime: '17:00',
    badgeUnlockNotifications: true,
    appUpdatesNotifications: false,
  },
  privacy: {
    parentalConsent: false,
    consentDate: null,
    analyticsEnabled: false,
    shareProgress: false,
  },
};

describe('AccessibilitySection', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rend sans crash', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByTestId('settings-accessibility')).toBeInTheDocument();
  });

  it('affiche le titre Accessibilite', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByText('Accessibilite')).toBeInTheDocument();
  });

  it('affiche la description', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(
      screen.getByText('Animations, contraste, taille du texte')
    ).toBeInTheDocument();
  });

  it('rend le toggle reduced-motion', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByTestId('toggle-reduced-motion')).toBeInTheDocument();
  });

  it('rend le toggle high-contrast', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByTestId('toggle-high-contrast')).toBeInTheDocument();
  });

  it('rend le slider text-scale', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByTestId('slider-text-scale')).toBeInTheDocument();
  });

  it('rend le slider animation-speed', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByTestId('slider-animation-speed')).toBeInTheDocument();
  });

  it('affiche le label Reduire les animations', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByText('Reduire les animations')).toBeInTheDocument();
  });

  it('affiche le label Contraste eleve', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByText('Contraste eleve')).toBeInTheDocument();
  });

  it('appelle updateSetting avec accessibility.reducedMotion quand toggle clique', () => {
    const updateSetting = vi.fn();
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const switchEl = screen.getByLabelText('Reduire les animations');
    fireEvent.click(switchEl);
    expect(updateSetting).toHaveBeenCalledWith(
      'accessibility.reducedMotion',
      true
    );
  });

  it('appelle updateSetting avec accessibility.highContrast quand toggle clique', () => {
    const updateSetting = vi.fn();
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const switchEl = screen.getByLabelText('Contraste eleve');
    fireEvent.click(switchEl);
    expect(updateSetting).toHaveBeenCalledWith(
      'accessibility.highContrast',
      true
    );
  });

  it('affiche la valeur formatee du textScale (100%)', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('affiche Normal pour animationSpeed=1.0', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('affiche Lent pour animationSpeed=0.75', () => {
    const settings = {
      ...defaultSettings,
      accessibility: { ...defaultSettings.accessibility, animationSpeed: 0.75 },
    };
    render(
      <AccessibilitySection settings={settings} updateSetting={vi.fn()} />
    );
    expect(screen.getByText('Lent')).toBeInTheDocument();
  });

  it('affiche Tres lent pour animationSpeed=0.5', () => {
    const settings = {
      ...defaultSettings,
      accessibility: { ...defaultSettings.accessibility, animationSpeed: 0.5 },
    };
    render(
      <AccessibilitySection settings={settings} updateSetting={vi.fn()} />
    );
    expect(screen.getByText('Tres lent')).toBeInTheDocument();
  });

  it('affiche Rapide pour animationSpeed=1.5', () => {
    const settings = {
      ...defaultSettings,
      accessibility: { ...defaultSettings.accessibility, animationSpeed: 1.5 },
    };
    render(
      <AccessibilitySection settings={settings} updateSetting={vi.fn()} />
    );
    expect(screen.getByText('Rapide')).toBeInTheDocument();
  });

  it('affiche Tres rapide pour animationSpeed=2.0', () => {
    const settings = {
      ...defaultSettings,
      accessibility: { ...defaultSettings.accessibility, animationSpeed: 2.0 },
    };
    render(
      <AccessibilitySection settings={settings} updateSetting={vi.fn()} />
    );
    expect(screen.getByText('Tres rapide')).toBeInTheDocument();
  });

  it('le slider animation-speed est desactive quand reducedMotion=true', () => {
    const settings = {
      ...defaultSettings,
      accessibility: { ...defaultSettings.accessibility, reducedMotion: true },
    };
    render(
      <AccessibilitySection settings={settings} updateSetting={vi.fn()} />
    );
    const slider = screen
      .getByTestId('slider-animation-speed')
      .querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider.disabled).toBe(true);
  });

  it('le slider animation-speed est actif quand reducedMotion=false', () => {
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={vi.fn()}
      />
    );
    const slider = screen
      .getByTestId('slider-animation-speed')
      .querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider.disabled).toBe(false);
  });

  it('appelle updateSetting pour textScale quand slider change', () => {
    const updateSetting = vi.fn();
    render(
      <AccessibilitySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const slider = screen
      .getByTestId('slider-text-scale')
      .querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '1.2' } });
    expect(updateSetting).toHaveBeenCalledWith('accessibility.textScale', 1.2);
  });
});
