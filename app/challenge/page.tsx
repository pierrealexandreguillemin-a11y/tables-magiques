/**
 * Challenge Page - Thin Wrapper
 * ISO/IEC 25010 - Orchestrateur minimal
 *
 * La logique metier est dans useChallenge
 * L'UI est dans ChallengePage component
 */

import { ChallengePage } from '@/features/game';

export default function Page() {
  return <ChallengePage />;
}
