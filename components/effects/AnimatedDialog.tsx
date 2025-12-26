'use client';

/**
 * AnimatedDialog - Dialog avec animations Framer Motion
 * ISO/IEC 25010 - UX enrichie pour modals
 */

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
};

interface AnimatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AnimatedDialog({
  open,
  onOpenChange,
  children,
}: AnimatedDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function AnimatedDialogTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>
  );
}

interface AnimatedDialogContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function AnimatedDialogContent({
  children,
  className,
  showCloseButton = true,
}: AnimatedDialogContentProps) {
  const { shouldAnimate } = useReducedMotion();

  return (
    <AnimatePresence>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay asChild forceMount>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            variants={shouldAnimate ? overlayVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild forceMount>
          <motion.div
            className={cn(
              'fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
              'bg-background rounded-2xl border-2 border-primary/20 p-6 shadow-2xl',
              'focus:outline-none',
              className
            )}
            initial={shouldAnimate ? contentVariants.initial : undefined}
            animate={shouldAnimate ? contentVariants.animate : undefined}
            exit={shouldAnimate ? contentVariants.exit : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-2 opacity-70 hover:opacity-100 hover:bg-muted transition-all">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </DialogPrimitive.Close>
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </AnimatePresence>
  );
}

export function AnimatedDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center', className)}
      {...props}
    />
  );
}

export function AnimatedDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-xl font-bold', className)}
      {...props}
    />
  );
}

export function AnimatedDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export function AnimatedDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex justify-center gap-3 mt-6', className)}
      {...props}
    />
  );
}
