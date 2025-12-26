/**
 * Lazy Loading - Composants d'animation lourds
 * ISO/IEC 25010 - Performance, Efficacité
 *
 * Charge les composants lourds (Lottie, Particles, GSAP)
 * uniquement quand nécessaire pour réduire le bundle initial.
 *
 * Économie estimée: ~150KB sur le bundle initial
 */

import dynamic from 'next/dynamic';

// =============================================================================
// LAZY COMPONENTS
// =============================================================================

/**
 * ParticlesBackground - Chargé à la demande
 * Poids: ~80KB (tsParticles engine)
 */
export const LazyParticlesBackground = dynamic(
  () =>
    import('@/components/effects/ParticlesBackground').then((mod) => ({
      default: mod.ParticlesBackground,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * LottieAnimation - Chargé à la demande
 * Poids: ~50KB (lottie-react + JSON)
 */
export const LazyLottieAnimation = dynamic(
  () =>
    import('@/components/effects/LottieAnimation').then((mod) => ({
      default: mod.LottieAnimation,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse bg-white/20 rounded-full"
        style={{ width: 100, height: 100 }}
      />
    ),
  }
);

/**
 * SuccessExplosion - Chargé à la demande
 * Poids: ~20KB (GSAP effects)
 */
export const LazySuccessExplosion = dynamic(
  () =>
    import('@/components/effects/SuccessExplosion').then((mod) => ({
      default: mod.SuccessExplosion,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * BadgeUnlockModal - Chargé à la demande
 * Poids: ~15KB (Dialog + animations)
 */
export const LazyBadgeUnlockModal = dynamic(
  () =>
    import('@/components/effects/BadgeUnlockModal').then((mod) => ({
      default: mod.BadgeUnlockModal,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * FairyBackground - Chargé à la demande
 * Poids: ~80KB (tsParticles)
 */
export const LazyFairyBackground = dynamic(
  () =>
    import('@/components/effects/FairyBackground').then((mod) => ({
      default: mod.FairyBackground,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * GsapCelebration - Chargé à la demande
 * Poids: ~25KB (GSAP effects)
 */
export const LazyGsapCelebration = dynamic(
  () =>
    import('@/components/effects/GsapCelebration').then((mod) => ({
      default: mod.GsapCelebration,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

// =============================================================================
// PRELOAD HELPERS
// =============================================================================

/**
 * Précharge les composants lourds en arrière-plan
 * À appeler après le premier rendu de la page
 */
export async function preloadHeavyComponents(): Promise<void> {
  const preloads = [
    import('@/components/effects/LottieAnimation'),
    import('@/components/effects/SuccessExplosion'),
  ];

  await Promise.allSettled(preloads);
}

/**
 * Précharge les particules (pour pages avec fond animé)
 */
export async function preloadParticles(): Promise<void> {
  await import('@/components/effects/ParticlesBackground');
  await import('@/components/effects/FairyBackground');
}
