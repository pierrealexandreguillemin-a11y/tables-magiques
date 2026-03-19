'use client';

/**
 * PulseGlow - Wrapper avec effet de glow pulsant
 * ISO/IEC 25010 - Mise en evidence visuelle
 * Simplified: blur layer removed to eliminate paint-per-frame lag.
 */

import { cn } from '@/lib/utils';

interface PulseGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  active?: boolean;
  className?: string;
}

export function PulseGlow({
  children,
  active = true,
  className,
}: PulseGlowProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative inline-block', className)}>{children}</div>
  );
}

export default PulseGlow;
