/**
 * HomeHeader
 * ISO/IEC 25010 - SRP: Header only
 */

'use client';

import Link from 'next/link';
import { Settings, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import { UserButton } from '@/features/auth';
import { HelpButton } from '@/components/ui/HelpButton';
import { ShareDialog } from './ShareDialog';

export function HomeHeader() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ShareDialog />
      <Link
        href="/profile"
        data-tour="profile-button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Mon profil"
      >
        <User className="h-5 w-5" />
      </Link>
      <Link
        href="/settings"
        data-tour="settings-button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Parametres"
      >
        <Settings className="h-5 w-5" />
      </Link>
      <HelpButton className="text-white/80 hover:bg-white/20" />
      <UserButton />
      <InstallButton />
      <ThemeToggle />
    </div>
  );
}
