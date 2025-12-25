/**
 * Configuration du site - ISO/IEC 25010 (Configuration)
 */

export const siteConfig = {
  name: 'Tables Magiques',
  description:
    "Apprends tes tables de multiplication en t'amusant avec la magie des licornes !",
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://tables-magiques.vercel.app',
  author: 'Tables Magiques',
  keywords: [
    'multiplication',
    'tables',
    'maths',
    'enfants',
    'jeu',
    'education',
    'licorne',
  ],
  themeColor: '#ff69b4',
  backgroundColor: '#ba55d3',
} as const;
