import type { PuzzleData, Difficulty, Dot } from '@/types';
import { PUZZLE_COLORS } from './puzzle-colors';

const createDot = (x: number, y: number, colorName: string, index: number): Dot => ({
  id: `${colorName}-${index}`,
  x,
  y,
  color: PUZZLE_COLORS[colorName],
  pairId: colorName,
});

export const puzzles: { [key in Difficulty]: PuzzleData[] } = {
  easy: [
    {
      id: 0,
      difficulty: 'easy',
      name: 'Easy 1',
      size: 5,
      dots: [
        createDot(0, 0, 'red', 0), createDot(4, 4, 'red', 1),
        createDot(0, 2, 'blue', 0), createDot(3, 2, 'blue', 1),
      ],
    },
    {
      id: 1,
      difficulty: 'easy',
      name: 'Easy 2',
      size: 5,
      dots: [
        createDot(1, 1, 'green', 0), createDot(3, 3, 'green', 1),
        createDot(0, 4, 'yellow', 0), createDot(4, 0, 'yellow', 1),
      ],
    },
    // Add 18 more easy puzzles
  ],
  medium: [
    {
      id: 0,
      difficulty: 'medium',
      name: 'Medium 1',
      size: 7,
      dots: [
        createDot(0, 0, 'red', 0), createDot(6, 6, 'red', 1),
        createDot(1, 2, 'blue', 0), createDot(5, 2, 'blue', 1),
        createDot(2, 5, 'green', 0), createDot(6, 1, 'green', 1),
      ],
    },
    // Add 19 more medium puzzles
  ],
  hard: [
    {
      id: 0,
      difficulty: 'hard',
      name: 'Hard 1',
      size: 8,
      dots: [
        createDot(0, 0, 'red', 0), createDot(7, 7, 'red', 1),
        createDot(0, 7, 'blue', 0), createDot(7, 0, 'blue', 1),
        createDot(2, 2, 'green', 0), createDot(5, 5, 'green', 1),
        createDot(2, 5, 'yellow', 0), createDot(5, 2, 'yellow', 1),
      ],
    },
    // Add 19 more hard puzzles
  ],
};

// For simplicity in development, let's fill remaining puzzles with copies of the first one.
// In a real scenario, these would be unique.
function populatePuzzles(difficulty: Difficulty, count: number) {
  const basePuzzles = puzzles[difficulty];
  if (basePuzzles.length === 0) return; // No base puzzle to copy
  while (basePuzzles.length < count) {
    const copy = JSON.parse(JSON.stringify(basePuzzles[0])) as PuzzleData;
    copy.id = basePuzzles.length;
    copy.name = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${copy.id + 1}`;
    // Slightly vary dot positions for copies to avoid identical puzzles if needed, or just use as is for placeholders
    // For now, just copying directly.
    basePuzzles.push(copy);
  }
}

populatePuzzles('easy', 3); // For testing, generate 3 easy puzzles. Max 20.
populatePuzzles('medium', 1); // Max 20.
populatePuzzles('hard', 1); // Max 20.

export const getPuzzle = (difficulty: Difficulty, id: number): PuzzleData | undefined => {
  return puzzles[difficulty]?.find(p => p.id === id);
};

export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: puzzles.easy.length,
  medium: puzzles.medium.length,
  hard: puzzles.hard.length,
};
