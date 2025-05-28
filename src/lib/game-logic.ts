
import type { PuzzleData, GridCellData, Dot, DrawnPath, GameState } from '@/types';

export function initializeGameState(puzzle: PuzzleData): GameState {
  const grid: GridCellData[][] = Array(puzzle.size)
    .fill(null)
    .map((_, y) =>
      Array(puzzle.size)
        .fill(null)
        .map((__, x) => ({
          x,
          y,
          isDot: false,
          pathColor: null,
          pathId: null,
        }))
    );

  const paths: Record<string, DrawnPath> = {};
  const dotMap: Map<string, Dot> = new Map(); // Store dots by their unique ID for quick lookup

  puzzle.dots.forEach(dot => {
    grid[dot.y][dot.x] = {
      x: dot.x,
      y: dot.y,
      isDot: true,
      dot: { ...dot }, // Store a copy of the dot object
      pathColor: null, // Dots initially don't have a path over them unless drawing starts
      pathId: null,
    };
    dotMap.set(dot.id, dot);

    // Initialize paths for each color pair
    if (!paths[dot.pairId]) {
      paths[dot.pairId] = {
        id: dot.pairId,
        color: dot.color,
        points: [],
        isComplete: false,
      };
    }
  });

  return {
    grid,
    paths,
    activePath: null,
    completedPairs: new Set(),
  };
}

export function isMoveValid(
  gameState: GameState,
  targetX: number,
  targetY: number,
): boolean {
  if (!gameState.activePath) return false;
  const { grid, activePath } = gameState;
  const { size } = grid.length === 0 ? { size: 0 } : { size: grid.length }; // Assuming square grid

  // Check bounds
  if (targetX < 0 || targetX >= size || targetY < 0 || targetY >= size) {
    return false;
  }

  const currentCell = grid[targetY][targetX];
  const activePathColor = activePath.color;
  const activePathId = activePath.id;

  // If target cell is a dot
  if (currentCell.isDot) {
    // Can only end on a dot of the same color/pairId, and it must be the other dot of the pair
    const startDot = activePath.points[0];
    // Check if target dot is different from start dot but has same pairId
    return currentCell.dot?.pairId === activePathId && 
           (currentCell.dot.x !== startDot.x || currentCell.dot.y !== startDot.y);
  }

  // If target cell is not a dot, it must be empty or part of the current active path (for retracing)
  if (currentCell.pathColor && currentCell.pathColor !== activePathColor) {
    return false; // Cannot cross path of different color
  }
  
  // Allow moving into a cell already part of the active path (retracing)
  if (currentCell.pathColor === activePathColor && currentCell.pathId === activePathId) {
     const isRetracing = activePath.points.some(p => p.x === targetX && p.y === targetY);
     if (isRetracing) return true; // Further logic in updateActivePath will handle retracing
  }

  // If cell is occupied by a completed path of the same color (but not the active one), it's invalid unless it's the target dot.
  // This case is tricky. For now, let's assume completed paths are "fixed".
  // If it's not a dot and has no path or path of same color (not yet completed for this pathId)
  return !currentCell.pathColor || currentCell.pathColor === activePathColor;
}


export function updateGridWithPath(grid: GridCellData[][], path: DrawnPath, clear: boolean = false): GridCellData[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  path.points.forEach(point => {
    if (newGrid[point.y] && newGrid[point.y][point.x]) {
      // Don't overwrite dot information itself, only path properties
      const cell = newGrid[point.y][point.x];
      if (!clear) {
        cell.pathColor = path.color;
        cell.pathId = path.id;
      } else if (cell.pathId === path.id) { // Only clear if it was part of this specific path
        cell.pathColor = null;
        cell.pathId = null;
      }
    }
  });
  return newGrid;
}


export function checkWinCondition(gameState: GameState, puzzle: PuzzleData): boolean {
  const { paths, completedPairs } = gameState; // Removed grid from here for now
  
  // 1. All dot pairs must be connected (i.e., their paths are marked as complete)
  // Create a set of all unique pair IDs from the initial puzzle definition.
  const allRequiredPairIds = new Set(puzzle.dots.map(dot => dot.pairId));
  if (completedPairs.size !== allRequiredPairIds.size) {
    return false;
  }
  // Also ensure that every path in gameState.paths that corresponds to a requiredPairId is actually complete.
  for (const pairId of allRequiredPairIds) {
    if (!paths[pairId] || !paths[pairId].isComplete) {
      return false;
    }
  }

  // 2. All cells must be filled by paths (Temporarily REMOVED for current puzzles)
  // const { grid } = gameState;
  // const puzzleSize = puzzle.size;
  // for (let y = 0; y < puzzleSize; y++) {
  //   for (let x = 0; x < puzzleSize; x++) {
  //     if (!grid[y][x].pathId) {
  //       return false;
  //     }
  //   }
  // }
  
  return true; // If all pairs are connected, it's a win (for now)
}

