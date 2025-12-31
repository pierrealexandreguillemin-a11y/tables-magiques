import type { Metadata, Viewport } from 'next';
import { Lexend, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

/**
 * Lexend - Police optimisée pour la dyslexie
 * Recherche Stanford: +17% fluence lecture
 * ISO/IEC 25010 - Accessibilité enfants
 */
const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * JetBrains Mono - Police monospace accessible
 * Pour affichage des chiffres/scores
 */
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tables Magiques',
  description:
    "Apprends tes tables de multiplication en t'amusant avec la magie des licornes !",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tables Magiques',
  },
  icons: {
    icon: [
      { url: '/icons-v6/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons-v6/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons-v6/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons-v6/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons-v6/apple-touch-icon.png', sizes: '180x180' },
      { url: '/icons-v6/icon-167.png', sizes: '167x167' },
      { url: '/icons-v6/icon-152.png', sizes: '152x152' },
      { url: '/icons-v6/icon-120.png', sizes: '120x120' },
      { url: '/icons-v6/icon-76.png', sizes: '76x76' },
      { url: '/icons-v6/icon-60.png', sizes: '60x60' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale et userScalable retirés pour WCAG 2.1 AA (zoom requis)
  themeColor: '#ff69b4',
};

// Script anti-FOUC (Flash Of Unstyled Content)
// Exécuté avant le rendu pour éviter le flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (error) { console.warn('[theme]', error); }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Les apple-touch-icons sont geres par metadata.icons.apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${lexend.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(error => {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
