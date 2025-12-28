/**
 * Types Onboarding - Tables Magiques
 * ISO/IEC 25010 - Tour guide premiere visite
 *
 * Features:
 * - Tour guide navigation assistee
 * - Etapes avec highlights
 * - Progression visuelle
 * - Accessibilite clavier
 */

// =============================================================================
// TOUR STEP
// =============================================================================

/**
 * Placement du tooltip
 */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Etape du tour guide
 */
export interface TourStep {
  /** ID unique de l'etape */
  id: string;
  /** Selecteur CSS de l'element cible */
  target: string;
  /** Titre de l'etape */
  title: string;
  /** Contenu/description */
  content: string;
  /** Placement du tooltip */
  placement?: TourPlacement;
  /** Autoriser click sur spotlight */
  spotlightClicks?: boolean;
  /** Desactiver le beacon pulse */
  disableBeacon?: boolean;
  /** Action optionnelle (navigation, etc.) */
  action?: TourAction;
}

/**
 * Action a executer pendant une etape
 */
export interface TourAction {
  /** Type d'action */
  type: 'navigate' | 'click' | 'focus' | 'scroll';
  /** Valeur (URL, selecteur, etc.) */
  value: string;
  /** Executer avant ou apres l'affichage */
  timing: 'before' | 'after';
}

// =============================================================================
// TOUR STATE
// =============================================================================

/**
 * Etat du tour guide
 */
export interface TourState {
  /** Tour actif */
  isActive: boolean;
  /** Index etape courante */
  currentStep: number;
  /** Tour complete */
  isCompleted: boolean;
  /** Peut etre skip */
  canSkip: boolean;
  /** Tour en pause */
  isPaused: boolean;
}

/**
 * Etat par defaut
 */
export const DEFAULT_TOUR_STATE: TourState = {
  isActive: false,
  currentStep: 0,
  isCompleted: false,
  canSkip: true,
  isPaused: false,
};

// =============================================================================
// TOUR STEPS CONFIGURATION
// =============================================================================

/**
 * Etapes du tour principal
 */
export const MAIN_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="logo"]',
    title: 'Bienvenue !',
    content:
      "Bienvenue dans Tables Magiques ! Apprends tes tables de multiplication en t'amusant avec la magie des licornes.",
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    id: 'practice',
    target: '[data-tour="practice-button"]',
    title: 'Mode Entraînement',
    content:
      'Choisis une table et entraîne-toi à ton rythme. Pas de chrono, pas de stress !',
    placement: 'bottom',
  },
  {
    id: 'challenge',
    target: '[data-tour="challenge-button"]',
    title: 'Mode Challenge',
    content:
      'Prêt pour le défi ? Réponds le plus vite possible et bats ton record !',
    placement: 'bottom',
  },
  {
    id: 'profile',
    target: '[data-tour="profile-button"]',
    title: 'Ton Profil',
    content: 'Collectionne des badges magiques et suis ta progression ici.',
    placement: 'bottom',
  },
  {
    id: 'settings',
    target: '[data-tour="settings-button"]',
    title: 'Parametres',
    content: "Personnalise l'app : sons, theme, accessibilite...",
    placement: 'left',
  },
  {
    id: 'help',
    target: '[data-tour="help-button"]',
    title: "Besoin d'aide ?",
    content: 'Clique sur ce bouton pour revoir ce guide a tout moment.',
    placement: 'left',
  },
  {
    id: 'ready',
    target: '[data-tour="practice-button"]',
    title: "C'est parti !",
    content: 'Tu es pret(e) ! Choisis un mode et amuse-toi bien !',
    placement: 'bottom',
    spotlightClicks: true,
  },
];

// =============================================================================
// HOOK RESULT
// =============================================================================

/**
 * Resultat du hook useOnboarding
 */
export interface UseOnboardingResult {
  /** Etat courant du tour */
  state: TourState;
  /** Liste des etapes */
  steps: TourStep[];
  /** Etape courante */
  currentStep: TourStep | null;
  /** Demarrer le tour */
  start: () => void;
  /** Etape suivante */
  next: () => void;
  /** Etape precedente */
  prev: () => void;
  /** Sauter le tour */
  skip: () => void;
  /** Terminer le tour */
  complete: () => void;
  /** Reinitialiser (pour replay) */
  reset: () => void;
  /** Aller a une etape specifique */
  goToStep: (stepIndex: number) => void;
  /** Mettre en pause */
  pause: () => void;
  /** Reprendre */
  resume: () => void;
}

// =============================================================================
// FIRST VISIT
// =============================================================================

/**
 * Cle localStorage premiere visite
 */
export const FIRST_VISIT_KEY = 'tables-magiques-first-visit';

/**
 * Cle localStorage tour complete
 */
export const TOUR_COMPLETED_KEY = 'tables-magiques-tour-completed';

/**
 * Resultat hook useFirstVisit
 */
export interface UseFirstVisitResult {
  /** Premiere visite */
  isFirstVisit: boolean;
  /** Tour deja complete */
  hasTourCompleted: boolean;
  /** Marquer comme visite */
  markAsVisited: () => void;
  /** Marquer tour complete */
  markTourCompleted: () => void;
  /** Reset (pour debug) */
  reset: () => void;
}
