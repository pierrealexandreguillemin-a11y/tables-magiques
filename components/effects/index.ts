/**
 * Export centralise des composants effects - ISO/IEC 25010
 */

export { FairyBackground } from './FairyBackground';
export type { FairyBackgroundProps } from './FairyBackground';

export { MagicCard } from './MagicCard';
export type { MagicCardProps } from './MagicCard';

export { MagicButton } from './MagicButton';
export type { MagicButtonProps } from './MagicButton';

export { AnswerIcon } from './AnswerIcon';
export type { AnswerIconProps, AnswerType, IconSize } from './AnswerIcon';

export { MagicCounter } from './MagicCounter';
export type {
  MagicCounterProps,
  CounterFormat,
  CounterSize,
} from './MagicCounter';

export { CrownProgress } from './CrownProgress';
export type { CrownProgressProps, CrownSize } from './CrownProgress';

export { MagicLoader } from './MagicLoader';
export type { MagicLoaderProps, LoaderType, LoaderSize } from './MagicLoader';

export { GsapCelebration } from './GsapCelebration';
export type { GsapCelebrationProps, CelebrationType } from './GsapCelebration';

export { ToastContainer } from './Toast';
export type { ToastContainerProps } from './Toast';

export { ToastProvider, useToastContext } from './ToastProvider';

export { GentleShake } from './GentleShake';
export { GradientText } from './GradientText';

export { LottieAnimation } from './LottieAnimation';
export { KawaiiMascot } from './KawaiiMascot';

// Nouveaux composants Phase 8+
export { PageTransition } from './PageTransition';
export { MorphingOverlay } from './MorphingOverlay';
export type { MorphingOverlayProps, MorphingVariant } from './MorphingOverlay';
export {
  AnimatedDialog,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
  AnimatedDialogFooter,
  AnimatedDialogTrigger,
} from './AnimatedDialog';
export { ConfirmationModal } from './ConfirmationModal';
export { NumberReveal } from './NumberReveal';
export { SuccessExplosion } from './SuccessExplosion';
export { BadgeUnlockModal } from './BadgeUnlockModal';
export { StaggerList } from './StaggerList';
export { MagneticButton } from './MagneticButton';
export { PulseGlow } from './PulseGlow';
export { ParticlesBackground } from './ParticlesBackground';

// Phase 9 - Enrichissement P2
export { BadgeIcon } from './BadgeIcon';
export type { BadgeId, BadgeIconProps } from './BadgeIcon';

export {
  Skeleton,
  BadgeSkeleton,
  BadgeGridSkeleton,
  ProfileSkeleton,
} from './Skeleton';

export { RippleEffect } from './RippleEffect';

export { AnimatedCheckbox } from './AnimatedCheckbox';

export { TextReveal, WordReveal } from './TextReveal';

export { ScrollReveal, ScrollRevealList } from './ScrollReveal';

// Phase 10 - P1 Completion
export { DirectionTabs, DirectionTabPanel } from './DirectionTabs';
export type {
  DirectionTabsProps,
  DirectionTabPanelProps,
  Tab,
} from './DirectionTabs';

export { GradientBorder, GradientBorderCard } from './GradientBorder';
export type {
  GradientBorderProps,
  GradientBorderCardProps,
} from './GradientBorder';
