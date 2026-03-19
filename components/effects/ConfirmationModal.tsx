'use client';

/**
 * ConfirmationModal - Modal de confirmation animé
 * ISO/IEC 25010 - Pattern confirmation avec feedback visuel
 */

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
            <div className="mx-auto mb-4 animate-fade-scale">
              <LottieAnimation type={animationType} size={80} />
            </div>
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
