import { assistantWelcome } from "./categorize";
import { seedCaptures, seedTasks } from "../data/seed";
import type { Capture, ChatMessage, Task } from "../types";

const KEY = "shotlist-v2";

export interface AppState {
  captures: Capture[];
  tasks: Task[];
  messages: ChatMessage[];
}

export function defaultState(): AppState {
  return {
    captures: seedCaptures(),
    tasks: seedTasks(),
    messages: [assistantWelcome()],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (
      !Array.isArray(parsed.captures) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.messages)
    ) {
      return defaultState();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}
