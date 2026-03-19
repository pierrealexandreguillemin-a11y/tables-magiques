/**
 * Tests batch-c — ConfirmationModal, BadgeUnlockModal, ScrollReveal, presets.ts
 * ISO/IEC 29119 - Tests unitaires
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      onClick,
      ref,
      ...props
    }: React.ComponentProps<'div'>) => (
      <div className={className} onClick={onClick} ref={ref} {...props}>
        {children}
      </div>
    ),
    button: ({
      children,
      className,
      onClick,
      disabled,
      ...props
    }: React.ComponentProps<'button'>) => (
      <button
        className={className}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
    span: ({ children, className, ...props }: React.ComponentProps<'span'>) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useInView: () => true,
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  }),
}));

vi.mock('@/hooks/useParticlesEngine', () => ({
  useParticlesEngine: () => true,
}));

vi.mock('@tsparticles/react', () => ({
  default: ({ id, className }: { id: string; className?: string }) => (
    <div data-testid="tsparticles" data-id={id} className={className} />
  ),
}));

vi.mock('@/lib/animations', () => ({
  confettiConfig: {},
}));

vi.mock('@/components/effects/LottieAnimation', () => ({
  LottieAnimation: ({ type, size }: { type: string; size?: number }) => (
    <div data-testid="lottie-animation" data-type={type} data-size={size} />
  ),
}));

vi.mock('@/components/effects/MagicButton', () => ({
  MagicButton: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button data-testid="magic-button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button data-testid="ui-button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/effects/BadgeIcon', () => ({
  BadgeIcon: ({ badgeId, size }: { badgeId: string; size?: number }) => (
    <div data-testid="badge-icon" data-badge-id={badgeId} data-size={size} />
  ),
}));

vi.mock('@/components/effects/GradientText', () => ({
  GradientText: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

// Radix Dialog mock — render children directly so modal content is always visible
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Overlay: ({
    children,
    asChild,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <div data-testid="dialog-overlay">{children}</div>
    ),
  Content: ({
    children,
    asChild,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <div data-testid="dialog-content">{children}</div>
    ),
  Title: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <h2 className={className}>{children}</h2>,
  Description: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
  Close: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <button className={className}>{children}</button>,
}));

// Mock AnimatedDialog subcomponents (used by ConfirmationModal)
vi.mock('@/components/effects/AnimatedDialog', () => ({
  AnimatedDialog: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  AnimatedDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-dialog-content">{children}</div>
  ),
  AnimatedDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-dialog-header">{children}</div>
  ),
  AnimatedDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="animated-dialog-title">{children}</h2>
  ),
  AnimatedDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="animated-dialog-description">{children}</p>
  ),
  AnimatedDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-dialog-footer">{children}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------

import { ConfirmationModal } from '@/components/effects/ConfirmationModal';
import { BadgeUnlockModal } from '@/components/effects/BadgeUnlockModal';
import {
  ScrollReveal,
  ScrollRevealList,
} from '@/components/effects/ScrollReveal';
import {
  getPreset,
  getStreakPreset,
  getScorePreset,
  LOTTIE_PRESETS,
} from '@/lib/animations/lottie/presets';

// ---------------------------------------------------------------------------
// 1. ConfirmationModal
// ---------------------------------------------------------------------------

describe('ConfirmationModal', () => {
  afterEach(() => vi.restoreAllMocks());

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Titre de confirmation',
    description: 'Es-tu sûr ?',
    onConfirm: vi.fn(),
  };

  it('rend sans crash', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByTestId('animated-dialog-content')).toBeInTheDocument();
  });

  it('affiche le titre', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Titre de confirmation')).toBeInTheDocument();
  });

  it('affiche la description', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Es-tu sûr ?')).toBeInTheDocument();
  });

  it('affiche les labels par defaut', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('accepte des labels personnalises', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmLabel="Oui, continuer"
        cancelLabel="Non, rester"
      />
    );
    expect(screen.getByText('Oui, continuer')).toBeInTheDocument();
    expect(screen.getByText('Non, rester')).toBeInTheDocument();
  });

  it('appelle onConfirm et onOpenChange(false) au clic confirmer', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmationModal
        {...defaultProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByText('Confirmer'));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('appelle onCancel et onOpenChange(false) au clic annuler', () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmationModal
        {...defaultProps}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('affiche animation Lottie par defaut (showAnimation=true)', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('masque animation Lottie quand showAnimation=false', () => {
    render(<ConfirmationModal {...defaultProps} showAnimation={false} />);
    expect(screen.queryByTestId('lottie-animation')).not.toBeInTheDocument();
  });

  it('variante danger utilise animation error', () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveAttribute('data-type', 'error');
  });

  it('variante info utilise animation sparkles', () => {
    render(<ConfirmationModal {...defaultProps} variant="info" />);
    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveAttribute('data-type', 'sparkles');
  });

  it('variante warning utilise animation error', () => {
    render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveAttribute('data-type', 'error');
  });
});

// ---------------------------------------------------------------------------
// 3. BadgeUnlockModal
// ---------------------------------------------------------------------------

const mockBadge = {
  id: 'first',
  name: 'Premier Badge',
  description: 'Felicitations !',
  icon: '⭐',
  rarity: 'common' as const,
};

describe('BadgeUnlockModal', () => {
  afterEach(() => vi.restoreAllMocks());

  it('ne rend rien si badge=null', () => {
    const { container } = render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('rend quand badge fourni et open=true', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Premier Badge')).toBeInTheDocument();
  });

  it('affiche le nom du badge', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Premier Badge')).toBeInTheDocument();
  });

  it('affiche la description du badge', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Felicitations !')).toBeInTheDocument();
  });

  it('affiche la rarete en capitalise', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Common')).toBeInTheDocument();
  });

  it('affiche le titre Nouveau Badge !', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Nouveau Badge !')).toBeInTheDocument();
  });

  it('affiche le bouton Continuer', () => {
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    expect(screen.getByText('Continuer')).toBeInTheDocument();
  });

  it('appelle onOpenChange(false) au clic Continuer', () => {
    const onOpenChange = vi.fn();
    render(
      <BadgeUnlockModal
        open={true}
        onOpenChange={onOpenChange}
        badge={mockBadge}
      />
    );
    fireEvent.click(screen.getByText('Continuer'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('gere rarity legendary', () => {
    const legendary = { ...mockBadge, rarity: 'legendary' as const };
    render(
      <BadgeUnlockModal open={true} onOpenChange={vi.fn()} badge={legendary} />
    );
    expect(screen.getByText('Legendary')).toBeInTheDocument();
  });

  it('ne rend pas quand open=false', () => {
    const { container } = render(
      <BadgeUnlockModal open={false} onOpenChange={vi.fn()} badge={mockBadge} />
    );
    // AnimatePresence with open=false → no content rendered
    expect(container.querySelector('[data-testid="badge-icon"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. ScrollReveal
// ---------------------------------------------------------------------------

describe('ScrollReveal', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rend les children', () => {
    render(
      <ScrollReveal>
        <span>Contenu</span>
      </ScrollReveal>
    );
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('accepte className', () => {
    const { container } = render(
      <ScrollReveal className="reveal-class">
        <span>Test</span>
      </ScrollReveal>
    );
    expect(container.firstChild).toHaveClass('reveal-class');
  });

  it('accepte toutes les variantes sans crash', () => {
    const variants = [
      'fade-up',
      'fade-down',
      'scale',
      'slide-left',
      'slide-right',
    ] as const;
    for (const v of variants) {
      const { unmount } = render(
        <ScrollReveal variant={v}>
          <span>Variant {v}</span>
        </ScrollReveal>
      );
      expect(screen.getByText(`Variant ${v}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('accepte delay et duration', () => {
    render(
      <ScrollReveal delay={0.5} duration={1.2}>
        <span>Delayed</span>
      </ScrollReveal>
    );
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('accepte triggerOnce=false', () => {
    render(
      <ScrollReveal triggerOnce={false}>
        <span>Repeat</span>
      </ScrollReveal>
    );
    expect(screen.getByText('Repeat')).toBeInTheDocument();
  });
});

describe('ScrollRevealList', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rend les items enfants', () => {
    render(
      <ScrollRevealList>
        <span>Item 1</span>
        <span>Item 2</span>
      </ScrollRevealList>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('accepte itemClassName', () => {
    render(
      <ScrollRevealList itemClassName="item-class">
        <span>Item</span>
      </ScrollRevealList>
    );
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('accepte staggerDelay', () => {
    render(
      <ScrollRevealList staggerDelay={0.2}>
        <span>Stagger</span>
      </ScrollRevealList>
    );
    expect(screen.getByText('Stagger')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 5. presets.ts
// ---------------------------------------------------------------------------

describe('LOTTIE_PRESETS', () => {
  it('contient toutes les cles de contexte', () => {
    const expectedKeys = [
      'correct-answer',
      'wrong-answer',
      'streak-3',
      'streak-5',
      'streak-10',
      'level-complete',
      'perfect-score',
      'badge-unlock',
      'loading',
      'idle',
    ];
    for (const key of expectedKeys) {
      expect(LOTTIE_PRESETS).toHaveProperty(key);
    }
  });

  it('loading a loop=true', () => {
    expect(LOTTIE_PRESETS['loading'].loop).toBe(true);
  });

  it('idle a loop=true', () => {
    expect(LOTTIE_PRESETS['idle'].loop).toBe(true);
  });

  it('correct-answer a loop=false', () => {
    expect(LOTTIE_PRESETS['correct-answer'].loop).toBe(false);
  });
});

describe('getPreset', () => {
  it('retourne le preset correct-answer', () => {
    const preset = getPreset('correct-answer');
    expect(preset.animationId).toBe('success');
    expect(preset.size).toBe(120);
    expect(preset.loop).toBe(false);
    expect(preset.autoplay).toBe(true);
    expect(preset.duration).toBe(1500);
  });

  it('retourne le preset perfect-score', () => {
    const preset = getPreset('perfect-score');
    expect(preset.animationId).toBe('crown');
    expect(preset.size).toBe(180);
  });

  it('retourne le preset loading avec loop infini', () => {
    const preset = getPreset('loading');
    expect(preset.animationId).toBe('loading');
    expect(preset.loop).toBe(true);
    expect(preset.duration).toBe(0);
  });

  it('retourne le preset badge-unlock', () => {
    const preset = getPreset('badge-unlock');
    expect(preset.animationId).toBe('celebration');
  });
});

describe('getStreakPreset', () => {
  it('retourne correct-answer pour streak < 3', () => {
    expect(getStreakPreset(1).animationId).toBe('success');
    expect(getStreakPreset(2).animationId).toBe('success');
  });

  it('retourne streak-3 preset pour streak exactement 3', () => {
    const preset = getStreakPreset(3);
    expect(preset.animationId).toBe('sparkles');
    expect(preset.size).toBe(80);
  });

  it('retourne streak-3 preset pour streak 4', () => {
    expect(getStreakPreset(4).animationId).toBe('sparkles');
  });

  it('retourne streak-5 preset pour streak exactement 5', () => {
    const preset = getStreakPreset(5);
    expect(preset.animationId).toBe('streak');
    expect(preset.size).toBe(100);
  });

  it('retourne streak-5 preset pour streak 9', () => {
    expect(getStreakPreset(9).animationId).toBe('streak');
  });

  it('retourne streak-10 preset pour streak exactement 10', () => {
    const preset = getStreakPreset(10);
    expect(preset.animationId).toBe('fireworks');
    expect(preset.size).toBe(150);
  });

  it('retourne streak-10 preset pour streak 50', () => {
    expect(getStreakPreset(50).animationId).toBe('fireworks');
  });
});

describe('getScorePreset', () => {
  it('retourne perfect-score pour score parfait (100%)', () => {
    const preset = getScorePreset(10, 10);
    expect(preset.animationId).toBe('crown');
  });

  it('retourne level-complete pour score >= 80%', () => {
    const preset = getScorePreset(8, 10);
    expect(preset.animationId).toBe('celebration');
  });

  it('retourne level-complete pour score < 80%', () => {
    const preset = getScorePreset(5, 10);
    expect(preset.animationId).toBe('celebration');
  });

  it('retourne level-complete pour score 0%', () => {
    const preset = getScorePreset(0, 10);
    expect(preset.animationId).toBe('celebration');
  });

  it('retourne perfect-score seulement pour ratio exact 1', () => {
    expect(getScorePreset(1, 1).animationId).toBe('crown');
    expect(getScorePreset(9, 10).animationId).toBe('celebration');
  });
});
