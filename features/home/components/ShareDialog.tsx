/**
 * ShareDialog
 * ISO/IEC 25010 - SRP: Share modal only
 */

'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ShareDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
          aria-label="Partager"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-gradient-to-br from-purple-500/95 via-pink-500/95 to-indigo-500/95 backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white drop-shadow-lg">
            <span className="inline-block mr-2 share-bounce">🦄</span>
            Partager Tables Magiques
            <span className="inline-block ml-2 share-sparkle">✨</span>
          </DialogTitle>
          <DialogDescription className="text-white/90 text-center font-medium">
            Scannez ce QR code pour accéder à l&apos;application
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-64 h-64 bg-white rounded-2xl p-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] interactive-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 rounded-2xl share-glow-pulse" />
            <Image
              src="/qr-code.svg"
              alt="QR Code Tables Magiques"
              fill
              className="object-contain p-2"
            />
          </div>
          <p
            className="text-sm text-white/80 text-center mt-2 animate-fade-up"
            style={{ '--delay': '0.5s' } as React.CSSProperties}
          >
            Partagez la magie des multiplications !
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
