import type { SwipeAction } from "./swipeActions";

export type CoachStep = "merge" | "reject" | "keep";

export const COACH_STORAGE_KEY = "approval-swipe-coach-done";

export const COACH_STEPS: CoachStep[] = ["merge", "reject", "keep"];

export function nextCoachStep(step: CoachStep): CoachStep | null {
  const i = COACH_STEPS.indexOf(step);
  return i < COACH_STEPS.length - 1 ? COACH_STEPS[i + 1]! : null;
}

export function coachStepMatches(
  step: CoachStep,
  action: SwipeAction,
): boolean {
  return step === action;
}

export function readCoachDone(): boolean {
  try {
    return sessionStorage.getItem(COACH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeCoachDone() {
  try {
    sessionStorage.setItem(COACH_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearCoachDone() {
  try {
    sessionStorage.removeItem(COACH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
