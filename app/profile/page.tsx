/**
 * Profile Page - Tables Magiques
 * ISO/IEC 25010 - Page wrapper mince
 */

import { ProfilePage } from '@/features/profile';

export const metadata = {
  title: 'Mon Profil | Tables Magiques',
  description: 'Statistiques et progression',
};

export default function Page() {
  return <ProfilePage />;
}
