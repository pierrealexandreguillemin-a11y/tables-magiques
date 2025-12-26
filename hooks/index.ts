/**
 * Export centralise des hooks - ISO/IEC 25010
 */

export { useReducedMotion } from './useReducedMotion';
export { useAuth } from './useAuth';
export type { AuthResult } from './useAuth';
export { useTheme } from './useTheme';
export type { Theme, UseThemeReturn } from './useTheme';
export { useInstallPrompt } from './useInstallPrompt';
export type { UseInstallPromptReturn } from './useInstallPrompt';
export { useGsapEffects } from './useGsapEffects';
export { useToast } from './useToast';
export { useAnnouncer, cleanupLiveRegions } from './useAnnouncer';
export {
  useAnimationVisibility,
  useAnimationOnce,
  useAnimationPause,
} from './useAnimationVisibility';
export { useSound } from './useSound';
export type { UseSoundReturn } from './useSound';
