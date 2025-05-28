"use client";

import type { PuzzleData, GridCellData, GameState, DrawnPath, Dot } from '@/types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeGameState, isMoveValid, updateGridWithPath, checkWinCondition } from '@/lib/game-logic';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import WinModal from '@/components/win-modal';
import { markLevelAsCompleted } from '@/lib/progress';

interface GameBoardProps {
  puzzle: PuzzleData;
  onLevelComplete: () => void;
  onNextLevel: () => void;
  currentLevelIndex: number;
  totalLevelsInDifficulty: number;
}

const CELL_SIZE = 50; // Adjust for desired cell size in pixels
const DOT_RADIUS_PERCENT = 0.35; // Dot radius as percentage of cell size
const LINE_WIDTH_PERCENT = 0.2; // Line width as percentage of cell size

export default function GameBoard({ puzzle, onLevelComplete, onNextLevel, currentLevelIndex, totalLevelsInDifficulty }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(puzzle));
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const boardSize = puzzle.size * CELL_SIZE;

  const resetBoard = useCallback(() => {
    setGameState(initializeGameState(puzzle));
    setShowWinModal(false);
  }, [puzzle]);

  useEffect(() => {
    resetBoard();
  }, [puzzle, resetBoard]);

  const getCellCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    
    if ('touches' in event) {
      svgPoint.x = event.touches[0].clientX;
      svgPoint.y = event.touches[0].clientY;
    } else {
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;
    }
    
    const screenCTM = svgRef.current.getScreenCTM();
    if (!screenCTM) return null;
    
    const { x, y } = svgPoint.matrixTransform(screenCTM.inverse());
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (col >= 0 && col < puzzle.size && row >= 0 && row < puzzle.size) {
      return { x: col, y: row };
    }
    return null;
  };

  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coords = getCellCoordinates(event);
    if (!coords) return;

    const cell = gameState.grid[coords.y][coords.x];
    if (cell.isDot && cell.dot) {
      const dot = cell.dot;
      // If this dot's pair is already complete, do nothing (or allow clearing its path)
      if (gameState.completedPairs.has(dot.pairId)) {
        // Optional: Allow clearing a completed path by clicking its dot
        // For now, completed paths are fixed.
        return;
      }

      // Clear existing path for this color if starting a new one
      let newGrid = gameState.grid;
      const existingPath = gameState.paths[dot.pairId];
      if (existingPath && existingPath.points.length > 0) {
        newGrid = updateGridWithPath(newGrid, existingPath, true); // Clear old path from grid
      }
      
      const newActivePath: DrawnPath = {
        id: dot.pairId,
        color: dot.color,
        points: [{ x: coords.x, y: coords.y }],
        isComplete: false,
      };
      setGameState(prev => ({
        ...prev,
        grid: updateGridWithPath(newGrid, newActivePath), // Mark starting cell of active path
        activePath: newActivePath,
        paths: { ...prev.paths, [dot.pairId]: newActivePath },
      }));
      setIsDrawing(true);
    }
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !gameState.activePath) return;
    event.preventDefault();
    
    const coords = getCellCoordinates(event);
    if (!coords) return;

    const { activePath } = gameState;
    const lastPoint = activePath.points[activePath.points.length - 1];

    // Only add new point if it's different from the last one
    if (coords.x === lastPoint.x && coords.y === lastPoint.y) return;
    
    // Check if move is to an adjacent cell (Manhattan distance 1)
    const dx = Math.abs(coords.x - lastPoint.x);
    const dy = Math.abs(coords.y - lastPoint.y);
    if (dx + dy !== 1) return; // Not an adjacent cell


    // Retracing logic
    const pointIndexInPath = activePath.points.findIndex(p => p.x === coords.x && p.y === coords.y);
    if (pointIndexInPath !== -1) { // Moving onto a cell already in the current path
      // Shorten path up to this point (exclusive of current cell to allow "stepping back")
      const newPoints = activePath.points.slice(0, pointIndexInPath +1 );
      const clearedPathSegment = { ...activePath, points: activePath.points.slice(pointIndexInPath + 1) };
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); // Clear the retraced part
      
      const updatedActivePath = { ...activePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePath); // Update grid with shortened path

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        activePath: updatedActivePath,
        paths: { ...prev.paths, [activePath.id]: updatedActivePath },
      }));
      return;
    }

    if (isMoveValid(gameState, coords.x, coords.y)) {
      const newPoints = [...activePath.points, { x: coords.x, y: coords.y }];
      const updatedActivePath = { ...activePath, points: newPoints };
      
      setGameState(prev => ({
        ...prev,
        grid: updateGridWithPath(prev.grid, updatedActivePath),
        activePath: updatedActivePath,
        paths: { ...prev.paths, [activePath.id]: updatedActivePath },
      }));

      // Check if landed on target dot
      const targetCell = gameState.grid[coords.y][coords.x];
      if (targetCell.isDot && targetCell.dot?.pairId === activePath.id && targetCell.dot.color === activePath.color) {
         // Target dot of the same pair found
         handlePointerUp(); // Simulate pointer up to complete path
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !gameState.activePath) return;
    setIsDrawing(false);

    const { activePath, grid } = gameState;
    const lastPoint = activePath.points[activePath.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x];

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid;

    if (targetCell.isDot && targetCell.dot?.pairId === activePath.id && activePath.points.length > 1) {
      // Valid path completion
      const completedPath = { ...activePath, isComplete: true };
      updatedPaths[activePath.id] = completedPath;
      updatedCompletedPairs.add(activePath.id);
    } else {
      // Invalid path, clear it from grid and reset path object for this color
      finalGrid = updateGridWithPath(grid, activePath, true); // Clear from grid
      updatedPaths[activePath.id] = { ...activePath, points: [], isComplete: false }; // Reset path
    }
    
    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      paths: updatedPaths,
      activePath: null,
      completedPairs: updatedCompletedPairs,
    }));

    // Check for win condition after state update
    // Use a slight delay or useEffect to check win condition on updated state
  };
  
  useEffect(() => {
    if (gameState.activePath === null) { // Check win only when no path is being actively drawn
        const puzzleIsWon = checkWinCondition(gameState, puzzle.size);
        if (puzzleIsWon) {
            setShowWinModal(true);
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete();
        }
    }
  }, [gameState, puzzle.size, puzzle.difficulty, puzzle.id, onLevelComplete]);


  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold text-primary">{puzzle.name}</h2>
      <div className="p-2 bg-card border-2 border-border rounded-lg shadow-md inline-block" style={{ touchAction: 'none' }}>
        <svg
          ref={svgRef}
          width={boardSize}
          height={boardSize}
          viewBox={`0 0 ${boardSize} ${boardSize}`}
          className="rounded"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp} // If mouse leaves SVG, consider it as pointer up
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Grid lines - optional */}
          {Array.from({ length: puzzle.size + 1 }).map((_, i) => (
            <React.Fragment key={`gridline-${i}`}>
              <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={boardSize} stroke="hsl(var(--border))" strokeWidth="0.5" />
              <line x1={0} y1={i * CELL_SIZE} x2={boardSize} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Paths */}
          {Object.values(gameState.paths).map(path =>
            path.points.length > 1 && (
              <polyline
                key={path.id}
                points={path.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={path.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={path.isComplete ? 'opacity-100' : 'opacity-70'}
              />
            )
          )}
          
          {/* Active path drawing */}
          {gameState.activePath && gameState.activePath.points.length > 1 && (
             <polyline
                points={gameState.activePath.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={gameState.activePath.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50 animate-pulse"
              />
          )}

          {/* Dots */}
          {puzzle.dots.map(dot => (
            <circle
              key={dot.id}
              cx={dot.x * CELL_SIZE + CELL_SIZE / 2}
              cy={dot.y * CELL_SIZE + CELL_SIZE / 2}
              r={CELL_SIZE * DOT_RADIUS_PERCENT}
              fill={dot.color}
              className="cursor-pointer"
              data-dot-id={dot.id}
            />
          ))}
        </svg>
      </div>
      <Button onClick={resetBoard} variant="outline">
        <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
      </Button>
      {showWinModal && (
        <WinModal
          isOpen={showWinModal}
          onClose={() => setShowWinModal(false)}
          onNextLevel={onNextLevel}
          onReplay={resetBoard}
          currentLevelIndex={currentLevelIndex}
          totalLevelsInDifficulty={totalLevelsInDifficulty}
        />
      )}
    </div>
  );
}
