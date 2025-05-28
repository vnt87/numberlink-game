
import type { PuzzleData, Difficulty, Dot } from '@/types';
import { PUZZLE_COLORS, COLOR_NAMES } from './puzzle-colors';

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
      name: 'Easy 1 (5x5)',
      size: 5,
      dots: [
        createDot(0, 0, COLOR_NAMES[0], 0), createDot(0, 4, COLOR_NAMES[0], 1), // Red
        createDot(1, 0, COLOR_NAMES[1], 0), createDot(1, 4, COLOR_NAMES[1], 1), // Blue
        createDot(2, 0, COLOR_NAMES[2], 0), createDot(2, 4, COLOR_NAMES[2], 1), // Green
        createDot(3, 0, COLOR_NAMES[3], 0), createDot(3, 4, COLOR_NAMES[3], 1), // Yellow
        createDot(4, 0, COLOR_NAMES[4], 0), createDot(4, 4, COLOR_NAMES[4], 1), // Orange
      ],
    },
  ],
  medium: [
    {
      id: 0,
      difficulty: 'medium',
      name: 'Medium 1 (6x6)',
      size: 6,
      dots: [
        createDot(0, 0, COLOR_NAMES[0], 0), createDot(0, 5, COLOR_NAMES[0], 1), // Red
        createDot(1, 0, COLOR_NAMES[1], 0), createDot(1, 5, COLOR_NAMES[1], 1), // Blue
        createDot(2, 0, COLOR_NAMES[2], 0), createDot(2, 5, COLOR_NAMES[2], 1), // Green
        createDot(3, 0, COLOR_NAMES[3], 0), createDot(3, 5, COLOR_NAMES[3], 1), // Yellow
        createDot(4, 0, COLOR_NAMES[4], 0), createDot(4, 5, COLOR_NAMES[4], 1), // Orange
        createDot(5, 0, COLOR_NAMES[5], 0), createDot(5, 5, COLOR_NAMES[5], 1), // Purple
      ],
    },
  ],
  hard: [
    {
      id: 0,
      difficulty: 'hard',
      name: 'Hard 1 (7x7)',
      size: 7,
      dots: [
        createDot(0, 0, COLOR_NAMES[0], 0), createDot(0, 6, COLOR_NAMES[0], 1), // Red
        createDot(1, 0, COLOR_NAMES[1], 0), createDot(1, 6, COLOR_NAMES[1], 1), // Blue
        createDot(2, 0, COLOR_NAMES[2], 0), createDot(2, 6, COLOR_NAMES[2], 1), // Green
        createDot(3, 0, COLOR_NAMES[3], 0), createDot(3, 6, COLOR_NAMES[3], 1), // Yellow
        createDot(4, 0, COLOR_NAMES[4], 0), createDot(4, 6, COLOR_NAMES[4], 1), // Orange
        createDot(5, 0, COLOR_NAMES[5], 0), createDot(5, 6, COLOR_NAMES[5], 1), // Purple
        createDot(6, 0, COLOR_NAMES[6], 0), createDot(6, 6, COLOR_NAMES[6], 1), // Pink
      ],
    },
  ],
};

// For simplicity in development, let's fill remaining puzzles with copies of the first one(s).
function populatePuzzles(difficulty: Difficulty, count: number) {
  const basePuzzles = puzzles[difficulty];
  if (basePuzzles.length === 0) return; // No base puzzle to copy

  let currentId = basePuzzles.length > 0 ? Math.max(...basePuzzles.map(p => p.id)) + 1 : 0;
  
  while (basePuzzles.length < count) {
    const templatePuzzle = basePuzzles[0]; 
    const copy = JSON.parse(JSON.stringify(templatePuzzle)) as PuzzleData;
    
    copy.id = currentId;
    // Update name to reflect the template size
    if (difficulty === 'easy') {
        copy.name = `Easy ${copy.id + 1} (${templatePuzzle.size}x${templatePuzzle.size})`;
    } else if (difficulty === 'medium') {
        copy.name = `Medium ${copy.id + 1} (${templatePuzzle.size}x${templatePuzzle.size})`;
    } else if (difficulty === 'hard') {
        copy.name = `Hard ${copy.id + 1} (${templatePuzzle.size}x${templatePuzzle.size})`;
    }
        
    basePuzzles.push(copy);
    currentId++;
  }
}

populatePuzzles('easy', 10); 
populatePuzzles('medium', 10); 
populatePuzzles('hard', 10);

export const getPuzzle = (difficulty: Difficulty, id: number): PuzzleData | undefined => {
  return puzzles[difficulty]?.find(p => p.id === id);
};

export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: puzzles.easy.length,
  medium: puzzles.medium.length,
  hard: puzzles.hard.length,
};
