import {
  isBefore,
  isSameDay,
  startOfToday,
} from "date-fns";

export type CelebrationState =
  | "ONE_LEFT"
  | "LAST_TODAY"
  | "DONE"
  | "GRADUATE_DONE"
  | null;

export interface CelebrationContext {
  totalPapers: number;
  remainingPapers: number;
  lastPaperDate: Date | null;
  isFinalYear: boolean;
  hasExams: boolean;
}

/**
 * Determine which celebration state applies.
 * Uses calendar dates (startOfDay) so time-of-day doesn't matter.
 */
export function getCelebrationState(ctx: CelebrationContext): CelebrationState {
  if (!ctx.hasExams || ctx.totalPapers === 0) return null;

  const today = startOfToday();

  if (ctx.remainingPapers === 0) {
    // All papers in the past
    return ctx.isFinalYear ? "GRADUATE_DONE" : "DONE";
  }

  if (ctx.remainingPapers === 1 && ctx.lastPaperDate) {
    if (isSameDay(ctx.lastPaperDate, today)) return "LAST_TODAY";
    // isBefore check already handled by remainingPapers count,
    // but if the single remaining is in the future -> ONE_LEFT
    if (isBefore(today, ctx.lastPaperDate)) return "ONE_LEFT";
    return "ONE_LEFT";
  }

  return null;
}

export function getCelebrationStorageKey(
  version: string,
  state: CelebrationState,
): string {
  return `easechaos:celebration:${version}:${state}`;
}

export function shouldShowCelebration(
  version: string,
  state: CelebrationState,
): boolean {
  if (!state) return false;
  if (typeof window === "undefined") return false;
  try {
    const key = getCelebrationStorageKey(version, state);
    return localStorage.getItem(key) !== "dismissed";
  } catch {
    return true;
  }
}

export function dismissCelebration(
  version: string,
  state: CelebrationState,
): void {
  if (!state) return;
  try {
    localStorage.setItem(getCelebrationStorageKey(version, state), "dismissed");
  } catch {
    // ignore
  }
}

export function resetCelebration(version: string): void {
  try {
    (["ONE_LEFT", "LAST_TODAY", "DONE", "GRADUATE_DONE"] as const).forEach(
      (s) => localStorage.removeItem(getCelebrationStorageKey(version, s)),
    );
  } catch {
    // ignore
  }
}
