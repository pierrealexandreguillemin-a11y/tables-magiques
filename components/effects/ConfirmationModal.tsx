'use client';

/**
 * ConfirmationModal - Modal de confirmation animé
 * ISO/IEC 25010 - Pattern confirmation avec feedback visuel
 */

import { motion } from 'framer-motion';
import {
  AnimatedDialog,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
  AnimatedDialogFooter,
} from './AnimatedDialog';
import { MagicButton } from './MagicButton';
import { Button } from '@/components/ui/button';
import { LottieAnimation } from './LottieAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
  showAnimation?: boolean;
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
};

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'info',
  showAnimation = true,
}: ConfirmationModalProps) {
  const { shouldAnimate } = useReducedMotion();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const animationType =
    variant === 'danger'
      ? 'error'
      : variant === 'warning'
        ? 'error'
        : 'sparkles';

  return (
    <AnimatedDialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent>
        <AnimatedDialogHeader>
          {showAnimation && (
            <motion.div
              className="mx-auto mb-4"
              initial={shouldAnimate ? iconVariants.initial : undefined}
              animate={shouldAnimate ? iconVariants.animate : undefined}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <LottieAnimation type={animationType} size={80} />
            </motion.div>
          )}
          <AnimatedDialogTitle>{title}</AnimatedDialogTitle>
          <AnimatedDialogDescription>{description}</AnimatedDialogDescription>
        </AnimatedDialogHeader>
        <AnimatedDialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <MagicButton
            variant={variant === 'danger' ? 'star' : 'princess'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </MagicButton>
        </AnimatedDialogFooter>
      </AnimatedDialogContent>
    </AnimatedDialog>
  );
}

export default ConfirmationModal;
