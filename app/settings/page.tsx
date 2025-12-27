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

export default function SettingsRoute() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Parametres
        </h1>
        <SettingsPage />
      </div>
    </main>
  );
}
