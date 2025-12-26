'use client';

/**
 * Template - Wrapper pour transitions de page
 * Re-render à chaque navigation pour AnimatePresence
 */

import { PageTransition } from '@/components/effects';

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
