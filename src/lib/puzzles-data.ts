
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
    // Additional easy puzzles will be populated by populatePuzzles
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
    // Additional medium puzzles will be populated by populatePuzzles
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
    // Additional hard puzzles will be populated by populatePuzzles
  ],
};

// For simplicity in development, let's fill remaining puzzles with copies of the first one(s).
// In a real scenario, these would be unique.
function populatePuzzles(difficulty: Difficulty, count: number) {
  const basePuzzles = puzzles[difficulty];
  if (basePuzzles.length === 0) return; // No base puzzle to copy

  let currentId = basePuzzles.length > 0 ? Math.max(...basePuzzles.map(p => p.id)) + 1 : 0;
  
  while (basePuzzles.length < count) {
    // Cycle through existing defined puzzles for variety if count > initial manually defined ones
    const templatePuzzle = basePuzzles[ (basePuzzles.length -1) % Math.min(basePuzzles.length, 2) ]; // Use first 1 or 2 as templates
    const copy = JSON.parse(JSON.stringify(templatePuzzle)) as PuzzleData;
    
    copy.id = currentId;
    copy.name = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${copy.id + 1}`;
    
    // Optional: slightly vary dot positions for copies to make them somewhat different.
    // This is a simple variation, could be more sophisticated.
    copy.dots = copy.dots.map((dot, index) => ({
      ...dot,
      // Example variation: shift x by 1 for even indices, y by 1 for odd, wrap around size
      // This is just a placeholder for actual unique puzzle design.
      // x: (dot.x + (index % 2 === 0 ? 1 : 0)) % copy.size,
      // y: (dot.y + (index % 2 !== 0 ? 1 : 0)) % copy.size,
    }));
    // Ensure dots are not on top of each other after variation, or ensure variation is valid.
    // For now, we will just copy directly to keep it simple as the main goal is placeholder levels.
    // So, effectively, the above dot variation is commented out.
    
    basePuzzles.push(copy);
    currentId++;
  }
}

populatePuzzles('easy', 10); // Generate 10 easy puzzles total.
populatePuzzles('medium', 10); // Generate 10 medium puzzles total.
populatePuzzles('hard', 10); // Generate 10 hard puzzles total.

export const getPuzzle = (difficulty: Difficulty, id: number): PuzzleData | undefined => {
  return puzzles[difficulty]?.find(p => p.id === id);
};

export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: puzzles.easy.length,
  medium: puzzles.medium.length,
  hard: puzzles.hard.length,
};

