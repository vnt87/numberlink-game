
import type { PuzzleData, Difficulty } from '@/types';

// --- INSTRUCTIONS FOR YOU ---
// 1. Populate the 'easy', 'medium', and 'hard' arrays below with your PuzzleData objects.
// 2. Ensure each PuzzleData object is valid and follows the types in src/types/index.ts.
// 3. Most importantly, ensure each puzzle is solvable by CONNECTING ALL DOTS AND FILLING THE ENTIRE GRID.
// 4. Puzzle 'id's should be 0-indexed and sequential within each difficulty.

// Example of one Easy PuzzleData object:
/*
const exampleEasyPuzzle: PuzzleData = {
  id: 0, // First easy puzzle
  difficulty: 'easy',
  name: 'Easy Starter 1',
  size: 5, // Represents a 5x5 grid
  dots: [
    { id: 'red-0', x: 0, y: 0, color: '#FF5252', pairId: 'red' },    // Top-left
    { id: 'red-1', x: 0, y: 4, color: '#FF5252', pairId: 'red' },    // Bottom-left
    { id: 'blue-0', x: 1, y: 0, color: '#448AFF', pairId: 'blue' },  // Next column, top
    { id: 'blue-1', x: 1, y: 4, color: '#448AFF', pairId: 'blue' },  // Next column, bottom
    { id: 'green-0', x: 2, y: 0, color: '#69F0AE', pairId: 'green' },
    { id: 'green-1', x: 2, y: 4, color: '#69F0AE', pairId: 'green' },
    { id: 'yellow-0', x: 3, y: 0, color: '#FFEB3B', pairId: 'yellow' },
    { id: 'yellow-1', x: 3, y: 4, color: '#FFEB3B', pairId: 'yellow' },
    { id: 'orange-0', x: 4, y: 0, color: '#FFAB40', pairId: 'orange' },
    { id: 'orange-1', x: 4, y: 4, color: '#FFAB40', pairId: 'orange' },
    // This example assumes these pairs can form paths that fill the entire 5x5 grid.
  ],
};
*/

export const PREGENERATED_PUZZLES: { [key in Difficulty]: PuzzleData[] } = {
  easy: [
    // Add your pre-generated EASY PuzzleData objects here.
    // For example:
    // {
    //   id: 0, difficulty: 'easy', name: 'Easy 1', size: 5,
    //   dots: [ { id: 'c1-0', x:0,y:0, color: '#FF5252', pairId:'c1'}, { id: 'c1-1', x:0,y:4, color: '#FF5252', pairId:'c1'}, /* ... more pairs ... */ ]
    // },
    // {
    //   id: 1, difficulty: 'easy', name: 'Easy 2', size: 5,
    //   dots: [ /* ... */ ]
    // },
  ],
  medium: [
    // Add your pre-generated MEDIUM PuzzleData objects here.
  ],
  hard: [
    // Add your pre-generated HARD PuzzleData objects here.
  ],
};

// If a difficulty has no puzzles, the game will show "No levels found".
// Make sure to provide at least one puzzle for each difficulty you want to be playable.
