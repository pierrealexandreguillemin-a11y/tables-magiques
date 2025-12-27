/**
 * Route /settings - Orchestrateur minimal
 * ISO/IEC 25010 - Separation of Concerns
 */

import { Metadata } from 'next';
import { SettingsPage } from '@/features/settings';

export const metadata: Metadata = {
  title: 'Parametres | Tables Magiques',
  description: 'Personnalise ton experience Tables Magiques',
};

export default function Page() {
  return <SettingsPage />;
}
