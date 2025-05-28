
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
      name: 'Easy 1 (2x2)', // Renamed to indicate size
      size: 2, // Changed size to 2x2
      dots: [ // New dot configuration for a 2x2 grid that fills completely
        createDot(0, 0, 'red', 0), createDot(1, 0, 'red', 1),
        createDot(0, 1, 'blue', 0), createDot(1, 1, 'blue', 1),
      ],
    },
    {
      id: 1,
      difficulty: 'easy',
      name: 'Easy 2',
      size: 5, // This puzzle might now be unsolvable if it doesn't fill the 5x5 grid
      dots: [
        createDot(1, 1, 'green', 0), createDot(3, 3, 'green', 1),
        createDot(0, 4, 'yellow', 0), createDot(4, 0, 'yellow', 1),
      ],
    },
    // Additional easy puzzles will be populated by populatePuzzles
  ],
  medium: [
    {
      id: 0,
      difficulty: 'medium',
      name: 'Medium 1',
      size: 7, // This puzzle might now be unsolvable if it doesn't fill the 7x7 grid
      dots: [
        createDot(0, 0, 'red', 0), createDot(6, 6, 'red', 1),
        createDot(1, 2, 'blue', 0), createDot(5, 2, 'blue', 1),
        createDot(2, 5, 'green', 0), createDot(6, 1, 'green', 1),
      ],
    },
    // Additional medium puzzles will be populated by populatePuzzles
  ],
  hard: [
    {
      id: 0,
      difficulty: 'hard',
      name: 'Hard 1',
      size: 8, // This puzzle might now be unsolvable if it doesn't fill the 8x8 grid
      dots: [
        createDot(0, 0, 'red', 0), createDot(7, 7, 'red', 1),
        createDot(0, 7, 'blue', 0), createDot(7, 0, 'blue', 1),
        createDot(2, 2, 'green', 0), createDot(5, 5, 'green', 1),
        createDot(2, 5, 'yellow', 0), createDot(5, 2, 'yellow', 1),
      ],
    },
    // Additional hard puzzles will be populated by populatePuzzles
  ],
};

// For simplicity in development, let's fill remaining puzzles with copies of the first one(s).
// In a real scenario, these would be unique and designed to be solvable by filling the grid.
function populatePuzzles(difficulty: Difficulty, count: number) {
  const basePuzzles = puzzles[difficulty];
  if (basePuzzles.length === 0) return; // No base puzzle to copy

  let currentId = basePuzzles.length > 0 ? Math.max(...basePuzzles.map(p => p.id)) + 1 : 0;
  
  while (basePuzzles.length < count) {
    // Cycle through existing defined puzzles for variety if count > initial manually defined ones
    // Using the very first puzzle (now the 2x2 one for easy) as template for new ones.
    const templatePuzzle = basePuzzles[0]; 
    const copy = JSON.parse(JSON.stringify(templatePuzzle)) as PuzzleData;
    
    copy.id = currentId;
    copy.name = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${copy.id + 1}`;
    if (difficulty === 'easy' && templatePuzzle.size === 2) { // Ensure new easy puzzles are also 2x2 like the template
        copy.name = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${copy.id + 1} (2x2)`;
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
