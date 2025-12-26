/**
 * NumberPad - Clavier numerique pour saisie reponse
 * ISO/IEC 25010 - Composant reutilisable et testable
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  canSubmit?: boolean;
  className?: string;
}

export function NumberPad({
  onNumberClick,
  onClear,
  onSubmit,
  disabled = false,
  canSubmit = true,
  className,
}: NumberPadProps) {
  const buttonBase =
    'w-full h-16 text-2xl font-bold rounded-xl transition-transform active:scale-95';

  return (
    <div
      role="group"
      aria-label="Clavier numérique"
      className={cn('grid grid-cols-3 gap-3 max-w-xs mx-auto', className)}
    >
      {/* Chiffres 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          className={cn(buttonBase, 'bg-white/20 hover:bg-white/30 text-white')}
          aria-label={String(num)}
        >
          {num}
        </Button>
      ))}

      {/* Effacer */}
      <Button
        onClick={onClear}
        disabled={disabled}
        className={cn(
          buttonBase,
          'bg-red-500/30 hover:bg-red-500/50 text-white'
        )}
        aria-label="Effacer"
      >
        ⌫
      </Button>

      {/* Zero */}
      <Button
        onClick={() => onNumberClick(0)}
        disabled={disabled}
        className={cn(buttonBase, 'bg-white/20 hover:bg-white/30 text-white')}
        aria-label="0"
      >
        0
      </Button>

      {/* Valider */}
      <Button
        onClick={onSubmit}
        disabled={disabled || !canSubmit}
        className={cn(
          buttonBase,
          'bg-green-500/30 hover:bg-green-500/50 text-white'
        )}
        aria-label="Valider"
      >
        ✓
      </Button>
    </div>
  );
}
