/**
 * ShareDialog
 * ISO/IEC 25010 - SRP: Share modal only
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
          aria-label="Partager"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-gradient-to-br from-purple-500/95 via-pink-500/95 to-indigo-500/95 backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white drop-shadow-lg">
            <motion.span
              className="inline-block mr-2"
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🦄
            </motion.span>
            Partager Tables Magiques
            <motion.span
              className="inline-block ml-2"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </DialogTitle>
          <DialogDescription className="text-white/90 text-center font-medium">
            Scannez ce QR code pour accéder à l&apos;application
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <motion.div
            className="relative w-64 h-64 bg-white rounded-2xl p-3 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 50px rgba(255,255,255,0.5)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 rounded-2xl"
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Image
              src="/qr-code.svg"
              alt="QR Code Tables Magiques"
              fill
              className="object-contain p-2"
            />
          </motion.div>
          <motion.p
            className="text-sm text-white/80 text-center mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Partagez la magie des multiplications !
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
