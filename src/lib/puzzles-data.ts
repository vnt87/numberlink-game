
import type { PuzzleData, Difficulty } from '@/types';
import { PREGENERATED_PUZZLES } from './pregenerated-puzzles';

// Use the pre-generated puzzles directly
export const puzzles: { [key in Difficulty]: PuzzleData[] } = {
  easy: PREGENERATED_PUZZLES.easy.length > 0 ? PREGENERATED_PUZZLES.easy : [],
  medium: PREGENERATED_PUZZLES.medium.length > 0 ? PREGENERATED_PUZZLES.medium : [],
  hard: PREGENERATED_PUZZLES.hard.length > 0 ? PREGENERATED_PUZZLES.hard : [],
};

export const getPuzzle = (difficulty: Difficulty, id: number): PuzzleData | undefined => {
  const puzzlesForDifficulty = puzzles[difficulty];
  if (!puzzlesForDifficulty) {
    console.warn(`No puzzles defined for difficulty: ${difficulty}`);
    return undefined;
  }
  const puzzle = puzzlesForDifficulty.find(p => p.id === id);
  if (!puzzle) {
    console.warn(`Puzzle with id ${id} not found in difficulty ${difficulty}`);
  }
  return puzzle;
};

export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: puzzles.easy.length,
  medium: puzzles.medium.length,
  hard: puzzles.hard.length,
};

// Validate that puzzle IDs are sequential and 0-indexed for each difficulty
function validatePuzzleIds(puzzleList: PuzzleData[], difficulty: Difficulty): void {
  if (!puzzleList || puzzleList.length === 0) return;

  const ids = puzzleList.map(p => p.id).sort((a, b) => a - b);
  
  if (ids[0] !== 0) {
    console.error(`Error in ${difficulty} puzzles: First puzzle ID should be 0, but found ${ids[0]}.`);
  }

  for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== i) {
      console.error(`Error in ${difficulty} puzzles: Missing or non-sequential puzzle ID. Expected ${i} but found ${ids[i]} (or a gap). Please ensure IDs are 0, 1, 2,...`);
      // It's hard to pinpoint the exact missing one without more complex logic,
      // but this flags that the sequence is broken.
      break; 
    }
    if (puzzleList.find(p => p.id === i)?.difficulty !== difficulty) {
      console.error(`Error in ${difficulty} puzzles: Puzzle with id ${i} has incorrect difficulty property.`);
    }
  }
}

if (typeof window !== 'undefined') { // Run validation only in the browser
  validatePuzzleIds(puzzles.easy, 'easy');
  validatePuzzleIds(puzzles.medium, 'medium');
  validatePuzzleIds(puzzles.hard, 'hard');
}
