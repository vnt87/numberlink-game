
import type { PuzzleData, GridCellData, Dot, DrawnPath, GameState, FlowData } from '@/types';

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
  
  puzzle.flows.forEach(flow => {
    flow.dots.forEach(dot => {
      if (grid[dot.y] && grid[dot.y][dot.x]) {
        grid[dot.y][dot.x] = {
          x: dot.x,
          y: dot.y,
          isDot: true,
          dot: { ...dot, pairId: flow.pairId }, // Ensure dot has pairId for consistency if needed elsewhere
          pathColor: null,
          pathId: null,
        };
      }
    });

    if (!paths[flow.pairId]) {
      paths[flow.pairId] = {
        id: flow.pairId,
        color: flow.color,
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
  const { size } = grid.length === 0 ? { size: 0 } : { size: grid.length };

  if (targetX < 0 || targetX >= size || targetY < 0 || targetY >= size) {
    return false;
  }

  const currentCell = grid[targetY][targetX];
  const activePathColor = activePath.color;
  const activePathId = activePath.id;

  if (currentCell.isDot) {
    const startDotCellInPath = activePath.points[0];
    // A dot on the grid has a `dot` property. This `dot` property should have a `pairId`.
    // `activePath.id` is the `pairId` of the flow being drawn.
    return currentCell.dot?.pairId === activePathId &&
           (currentCell.dot.x !== startDotCellInPath.x || currentCell.dot.y !== startDotCellInPath.y);
  }

  if (currentCell.pathColor && currentCell.pathColor !== activePathColor) {
    return false; 
  }
  
  if (currentCell.pathColor === activePathColor && currentCell.pathId === activePathId) {
     const isRetracing = activePath.points.some(p => p.x === targetX && p.y === targetY);
     if (isRetracing) return true;
  }

  return !currentCell.pathColor || currentCell.pathColor === activePathColor;
}


export function updateGridWithPath(grid: GridCellData[][], path: DrawnPath, clear: boolean = false): GridCellData[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  path.points.forEach(point => {
    if (newGrid[point.y] && newGrid[point.y][point.x]) {
      const cell = newGrid[point.y][point.x];
      if (!clear) {
        cell.pathColor = path.color;
        cell.pathId = path.id;
      } else if (cell.pathId === path.id) { 
        cell.pathColor = null;
        cell.pathId = null;
      }
    }
  });
  return newGrid;
}


export function checkWinCondition(gameState: GameState, puzzle: PuzzleData): boolean {
  const { grid, paths, completedPairs } = gameState;
  
  const allRequiredPairIds = new Set(puzzle.flows.map(flow => flow.pairId));
  if (completedPairs.size !== allRequiredPairIds.size) {
    return false;
  }
  for (const pairId of allRequiredPairIds) {
    if (!paths[pairId] || !paths[pairId].isComplete) {
      return false;
    }
  }

  const puzzleSize = puzzle.size;
  for (let y = 0; y < puzzleSize; y++) {
    for (let x = 0; x < puzzleSize; x++) {
      if (!grid[y][x].pathId) { 
        return false;
      }
    }
  }
  
  return true;
}
