import type { Difficulty, LevelCompletionStatus } from '@/types';

const PROGRESS_KEY_PREFIX = 'stretchykats-progress'; // Renamed prefix

export function getCompletedLevels(difficulty: Difficulty): number[] {
  if (typeof window === 'undefined') return [];
  const key = `${PROGRESS_KEY_PREFIX}-${difficulty}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

export function markLevelAsCompleted(difficulty: Difficulty, levelId: number): void {
  if (typeof window === 'undefined') return;
  const key = `${PROGRESS_KEY_PREFIX}-${difficulty}`;
  const completed = getCompletedLevels(difficulty);
  if (!completed.includes(levelId)) {
    completed.push(levelId);
    localStorage.setItem(key, JSON.stringify(completed));
    // Dispatch a custom event to notify other components on the same page (e.g., ProgressIndicator)
    window.dispatchEvent(new CustomEvent(`progressUpdate-${difficulty}`));
  }
}

export function getAllProgress(): LevelCompletionStatus {
  if (typeof window === 'undefined') return { easy: [], medium: [], hard: [] };
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const allProgress: LevelCompletionStatus = {};
  difficulties.forEach(diff => {
    allProgress[diff] = getCompletedLevels(diff);
  });
  return allProgress;
}

export function resetProgressForDifficulty(difficulty: Difficulty): void {
  if (typeof window === 'undefined') return;
  const key = `${PROGRESS_KEY_PREFIX}-${difficulty}`;
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(`progressUpdate-${difficulty}`));
}

export function resetAllProgress(): void {
  if (typeof window === 'undefined') return;
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  difficulties.forEach(diff => {
    localStorage.removeItem(`${PROGRESS_KEY_PREFIX}-${diff}`);
    window.dispatchEvent(new CustomEvent(`progressUpdate-${diff}`));
  });
}
