
export type Difficulty = "easy" | "medium" | "hard";

export interface Dot {
  id: string; // Unique identifier for the dot, e.g., "red-0"
  x: number;
  y: number;
  color: string; // Hex color string, e.g., "#FF0000" - can be useful for direct rendering if needed
}

export interface FlowData {
  pairId: string; // Identifier for the pair this flow represents, typically the color name like "red"
  color: string; // Hex color string for the flow
  dots: [Dot, Dot]; // The two dots that this flow connects
  solutionPath: { x: number; y: number }[]; // Sequence of grid coordinates for the solution path
}

export interface PuzzleData {
  id: number; // Unique ID for the puzzle within its difficulty, e.g., 0, 1, 2...
  difficulty: Difficulty;
  name: string; // e.g., "Easy 1"
  size: number; // Grid size, e.g., 5 for a 5x5 grid
  flows: FlowData[]; // Array of flows (dot pairs and their solutions) for the puzzle
}

export interface GridCellData {
  x: number;
  y: number;
  isDot: boolean;
  dot?: Dot; // Dot object if this cell contains a dot
  pathColor: string | null; // Hex color of the path occupying this cell
  pathId: string | null; // ID of the path (e.g., "red")
}

export interface DrawnPath {
  id: string; // Identifier for the path, typically the color name like "red"
  color: string; // Hex color string
  points: { x: number; y: number }[]; // Sequence of grid coordinates (cell centers)
  isComplete: boolean; // True if this path connects its two corresponding dots
}

export interface GameState {
  grid: GridCellData[][];
  paths: Record<string, DrawnPath>; // Keyed by pathId (e.g., "red")
  activePath: DrawnPath | null;
  completedPairs: Set<string>; // Set of pathIds (pairIds from FlowData) that are complete
}

export interface LevelCompletionStatus {
  [difficulty: string]: number[]; // Array of completed level IDs (0-indexed)
}
