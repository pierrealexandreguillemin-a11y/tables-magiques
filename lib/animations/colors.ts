/**
 * Animation Color Palettes - Tables Magiques
 * ISO/IEC 25010 - DRY: Source unique pour couleurs d'animation
 *
 * Utilisé par les rendus canvas (étoiles, confettis) et les animations CSS.
 */

/** Couleurs confetti (celebrations) */
export const CONFETTI_COLORS = [
  '#ff69b4', // Hot pink
  '#ffd700', // Gold
  '#00ff00', // Lime
  '#00ffff', // Cyan
  '#ff6b6b', // Coral
];

/** Etoiles du fond féerique (FairyBackground) */
export const FAIRY_STAR_COLORS = [
  '#fef08a', // Yellow 200
  '#fde047', // Yellow 300
  '#facc15', // Yellow 400
  '#ffffff', // White
  '#f472b6', // Pink 400
  '#c084fc', // Purple 400
];

/** Halo doré des étoiles du fond féerique */
export const FAIRY_STAR_GLOW = '#fbbf24';

/** Etincelles du mode défi */
export const SPARKLE_COLORS = ['#ffd700', '#ffffff', '#ff69b4'];

/** Theme gradient colors for GradientBorder */
export const THEME_GRADIENTS: Record<string, string> = {
  princess: 'linear-gradient(90deg, #ff69b4, #ff1493, #ba55d3, #ff69b4)',
  unicorn: 'linear-gradient(90deg, #a855f7, #8b5cf6, #6366f1, #a855f7)',
  star: 'linear-gradient(90deg, #fbbf24, #f59e0b, #eab308, #fbbf24)',
  rainbow:
    'linear-gradient(90deg, #ff69b4, #a855f7, #3b82f6, #22c55e, #fbbf24, #ff69b4)',
};

/** Theme glow colors for GradientBorder */
export const THEME_GLOWS: Record<string, string> = {
  princess: 'rgba(255, 105, 180, 0.5)',
  unicorn: 'rgba(168, 85, 247, 0.5)',
  star: 'rgba(251, 191, 36, 0.5)',
  rainbow: 'rgba(168, 85, 247, 0.4)',
};

/** Theme overlay colors for MorphingOverlay */
export const THEME_OVERLAYS: Record<string, string> = {
  princess: '#f472b6',
  unicorn: '#a855f7',
  star: '#facc15',
  rainbow:
    'linear-gradient(135deg, #f472b6 0%, #a855f7 33%, #6366f1 66%, #3b82f6 100%)',
};

/** UI accent colors */
export const ACCENT_PURPLE = '#a855f7';
export const ACCENT_ORANGE = '#f97316';
