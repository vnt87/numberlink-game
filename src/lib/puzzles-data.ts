
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
      name: 'Easy 1 (2x2)',
      size: 2,
      dots: [ 
        createDot(0, 0, 'red', 0), createDot(1, 0, 'red', 1),
        createDot(0, 1, 'blue', 0), createDot(1, 1, 'blue', 1),
      ],
    },
    // Additional easy puzzles will be populated by populatePuzzles
  ],
  medium: [
    {
      id: 0,
      difficulty: 'medium',
      name: 'Medium 1 (3x3)',
      size: 3, 
      dots: [
        createDot(0, 0, 'red', 0), createDot(0, 2, 'red', 1),
        createDot(1, 0, 'blue', 0), createDot(1, 2, 'blue', 1),
        createDot(2, 0, 'green', 0), createDot(2, 2, 'green', 1),
      ],
    },
    // Additional medium puzzles will be populated by populatePuzzles
  ],
  hard: [
    {
      id: 0,
      difficulty: 'hard',
      name: 'Hard 1 (4x4)',
      size: 4, 
      dots: [
        createDot(0, 0, 'red', 0), createDot(0, 3, 'red', 1),
        createDot(1, 0, 'blue', 0), createDot(1, 3, 'blue', 1),
        createDot(2, 0, 'green', 0), createDot(2, 3, 'green', 1),
        createDot(3, 0, 'yellow', 0), createDot(3, 3, 'yellow', 1),
      ],
    },
    // Additional hard puzzles will be populated by populatePuzzles
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
        copy.name = `Easy ${copy.id + 1} (2x2)`;
    } else if (difficulty === 'medium') {
        copy.name = `Medium ${copy.id + 1} (3x3)`;
    } else if (difficulty === 'hard') {
        copy.name = `Hard ${copy.id + 1} (4x4)`;
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

