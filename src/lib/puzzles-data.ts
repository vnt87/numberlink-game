
import type { PuzzleData, Difficulty, Dot } from '@/types';
import { PUZZLE_COLORS, COLOR_NAMES } from './puzzle-colors';

const createDot = (x: number, y: number, colorName: string, index: number): Dot => ({
  id: `${colorName}-${index}`, // e.g. red-0, red-1
  x,
  y,
  color: PUZZLE_COLORS[colorName],
  pairId: colorName, // e.g. "red"
});

// Base puzzles - these are solvable and fill the grid with simple vertical lines
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

// Helper to get two random, distinct, available positions
function getRandomAvailablePositions(size: number, occupiedCells: Set<string>): [{x: number, y: number}, {x: number, y: number}] | null {
  const availableCells: {x: number, y: number}[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!occupiedCells.has(`${c},${r}`)) {
        availableCells.push({ x: c, y: r });
      }
    }
  }

  if (availableCells.length < 2) {
    return null; // Not enough space for a pair
  }

  const getRandomCell = () => {
    const index = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[index];
    availableCells.splice(index, 1); // Remove cell so it can't be picked again for the same pair
    return cell;
  };

  const pos1 = getRandomCell();
  const pos2 = getRandomCell();
  
  return [pos1, pos2];
}


function populatePuzzles(difficulty: Difficulty, count: number) {
  const basePuzzles = puzzles[difficulty];
  if (basePuzzles.length === 0) return;

  let currentId = basePuzzles.length > 0 ? Math.max(...basePuzzles.map(p => p.id)) + 1 : 0;
  
  while (basePuzzles.length < count) {
    const templatePuzzle = basePuzzles[0]; // Use the first puzzle as a template
    const copy = JSON.parse(JSON.stringify(templatePuzzle)) as PuzzleData; // Deep copy
    
    copy.id = currentId;
    copy.name = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${copy.id + 1} (${templatePuzzle.size}x${templatePuzzle.size})`;

    // Randomize dot positions for the copied puzzle
    const newDots: Dot[] = [];
    const occupiedCells = new Set<string>(); // "x,y"
    
    // Get unique pairIds from the template
    const pairIds = Array.from(new Set(templatePuzzle.dots.map(d => d.pairId)));

    let possibleToPlaceAll = true;
    for (const pairId of pairIds) {
      const positions = getRandomAvailablePositions(copy.size, occupiedCells);
      if (positions) {
        const [pos1, pos2] = positions;
        const originalColorName = COLOR_NAMES.find(name => PUZZLE_COLORS[name] === templatePuzzle.dots.find(d => d.pairId === pairId)?.color);

        if (originalColorName) {
            newDots.push(createDot(pos1.x, pos1.y, originalColorName, 0)); // Suffix 0 for the first dot of a pair
            newDots.push(createDot(pos2.x, pos2.y, originalColorName, 1)); // Suffix 1 for the second dot
            occupiedCells.add(`${pos1.x},${pos1.y}`);
            occupiedCells.add(`${pos2.x},${pos2.y}`);
        } else {
            // Fallback if color name can't be found (should not happen with current setup)
            console.error(`Could not find original color name for pairId: ${pairId}`);
            possibleToPlaceAll = false;
            break;
        }
      } else {
        // Not enough space to place the pair, log and potentially use template dots
        console.warn(`Could not find random positions for pair ${pairId} in puzzle ${copy.name}. Using template positions as fallback for this puzzle.`);
        possibleToPlaceAll = false;
        break;
      }
    }

    if (possibleToPlaceAll) {
      copy.dots = newDots;
    } else {
      // If randomization failed (e.g. not enough space), fall back to template dots for this specific copy.
      // This ensures the game doesn't break, but this level won't be randomized.
      copy.dots = templatePuzzle.dots.map(dot => ({ ...dot, id: `${dot.pairId}-${dot.id.split('-')[1]}`}));
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

// IMPORTANT CAVEAT:
// The randomization of dot positions for levels 1-9 in each difficulty
// does NOT guarantee that the resulting puzzle will be solvable by filling the entire grid.
// It simply shuffles the start/end points of the pairs from the base template.
// True procedural generation of fillable Numberlink puzzles is a complex problem.
