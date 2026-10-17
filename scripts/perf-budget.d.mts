export interface RouteJs {
  loadKB: number;
  idleKB: number;
}

export function checkBudget(
  routes: Record<string, RouteJs>,
  budget: Record<string, RouteJs>
): string[];
