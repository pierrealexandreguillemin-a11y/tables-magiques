/**
 * Providers - Tables Magiques
 * ISO/IEC 25010 - React Query + Context providers + Effects + Error Monitoring
 *
 * LazyMotion: Reduce Framer Motion bundle by ~70kb
 * https://www.framer.com/motion/lazy-motion/
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/effects';
import { initErrorReporter } from '@/lib/errorReporter';
import { useAnimationSpeed } from '@/hooks/useAnimationSpeed';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Initialiser le error reporter une seule fois
  useEffect(() => {
    initErrorReporter();
  }, []);

  // Apply animation speed from settings
  useAnimationSpeed();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <ToastProvider>{children}</ToastProvider>
      </LazyMotion>
    </QueryClientProvider>
  );
}
