
"use client";

import type { PuzzleData, GridCellData, GameState, DrawnPath, Dot } from '@/types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeGameState, isMoveValid, updateGridWithPath, checkWinCondition } from '@/lib/game-logic';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import WinModal from '@/components/win-modal';
import { markLevelAsCompleted } from '@/lib/progress';
import { cn } from '@/lib/utils';

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
  const [firstClickedDotInfo, setFirstClickedDotInfo] = useState<{ dot: Dot, cellCoords: {x: number, y: number} } | null>(null);


  const boardSize = puzzle.size * CELL_SIZE;

  const resetBoard = useCallback(() => {
    setGameState(initializeGameState(puzzle));
    setShowWinModal(false);
    setFirstClickedDotInfo(null);
    setIsDrawing(false);
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
        const clickedDot = cell.dot;

        if (gameState.completedPairs.has(clickedDot.pairId)) {
            setFirstClickedDotInfo(null);
            setIsDrawing(false);
            return;
        }

        if (firstClickedDotInfo) { 
            if (clickedDot.pairId === firstClickedDotInfo.dot.pairId && clickedDot.id !== firstClickedDotInfo.dot.id) { 
                const prevDotCoords = firstClickedDotInfo.cellCoords;
                const dx = Math.abs(coords.x - prevDotCoords.x);
                const dy = Math.abs(coords.y - prevDotCoords.y);

                if (dx + dy === 1) { 
                    const tempActivePathForValidation: DrawnPath = {
                        id: clickedDot.pairId,
                        color: clickedDot.color,
                        points: [prevDotCoords],
                        isComplete: false,
                    };
                    // Temporarily use a copy of gameState for validation to avoid mutating the current state
                    // This validation activePath is only the start point. isMoveValid will check if target (coords) is valid from it.
                    const tempGameStateForValidation = { ...gameState, activePath: tempActivePathForValidation };


                    if (isMoveValid(tempGameStateForValidation, coords.x, coords.y)) {
                        let newGrid = gameState.grid;
                        const existingPath = gameState.paths[clickedDot.pairId];
                        if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                            newGrid = updateGridWithPath(newGrid, existingPath, true); // Clear previous incomplete attempt
                        }

                        const finalClickedPath: DrawnPath = {
                            id: clickedDot.pairId,
                            color: clickedDot.color,
                            points: [prevDotCoords, coords], // Path from first clicked to second clicked
                            isComplete: true,
                        };
                        newGrid = updateGridWithPath(newGrid, finalClickedPath); // Draw the completed path

                        const updatedPaths = { ...gameState.paths, [clickedDot.pairId]: finalClickedPath };
                        const updatedCompletedPairs = new Set(gameState.completedPairs).add(clickedDot.pairId);

                        setGameState(prev => ({
                            ...prev,
                            grid: newGrid,
                            paths: updatedPaths,
                            activePath: null,
                            completedPairs: updatedCompletedPairs,
                        }));
                        setFirstClickedDotInfo(null); // Clear selection
                        setIsDrawing(false);
                        return; 
                    } else {
                        // Invalid adjacent click, treat as new selection
                        setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                        // Clear any active path from previous selection if it was different
                        if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                            const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                            setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                        }
                    }
                } else {
                    // Dots are not adjacent, treat as new selection
                    setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                     if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                        const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                        setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                    }
                }
            } else if (clickedDot.id === firstClickedDotInfo.dot.id) { 
                setFirstClickedDotInfo(null); // Deselect
                setIsDrawing(false);
                if (gameState.activePath && gameState.activePath.id === clickedDot.pairId) { // Clear any visual 1-point path
                    const newGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                    setGameState(prev => ({
                        ...prev,
                        grid: newGrid,
                        activePath: null,
                        paths: {
                            ...prev.paths,
                            [clickedDot.pairId]: { ...(prev.paths[clickedDot.pairId] || { id: clickedDot.pairId, color: clickedDot.color, points:[]}), points: [], isComplete: false }
                        }
                    }));
                }
                return;
            } else { 
                // Clicked a different, unrelated dot. Treat as new selection.
                setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                 if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                    const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                    setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                }
            }
        } else { 
            // No dot was previously selected, so this is the first.
            setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
        }

        // Standard drag logic initiation:
        if (!gameState.completedPairs.has(clickedDot.pairId)) {
            let newGrid = gameState.grid;
            const existingPath = gameState.paths[clickedDot.pairId];
            
            if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                 newGrid = updateGridWithPath(newGrid, existingPath, true); // Clear previous incomplete path for this color
            }
            
            const newActivePath: DrawnPath = {
                id: clickedDot.pairId,
                color: clickedDot.color,
                points: [{ x: coords.x, y: coords.y }], // Path starts at the clicked dot
                isComplete: false,
            };
            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(newGrid, newActivePath), // Visually mark the start of the path
                activePath: newActivePath,
                paths: { ...prev.paths, [clickedDot.pairId]: newActivePath }, // Store new active path data
            }));
            setIsDrawing(true); // Start drawing mode
        }

    } else { // Clicked on a non-dot cell
        setFirstClickedDotInfo(null); 
        setIsDrawing(false); 
        if (gameState.activePath) { // If a path was being drawn and click is on empty cell, effectively cancels it.
            const newGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
            setGameState(prev => ({
                ...prev,
                grid: newGrid,
                activePath: null,
                paths: {
                    ...prev.paths,
                    [gameState.activePath!.id]: { ...(prev.paths[gameState.activePath!.id]), points: [], isComplete: false }
                }
            }));
        }
    }
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !gameState.activePath) return;
    event.preventDefault();
    
    const coords = getCellCoordinates(event);
    if (!coords) return;

    const { activePath } = gameState; // This is the activePath from the current state
    const lastPoint = activePath.points[activePath.points.length - 1];

    if (coords.x === lastPoint.x && coords.y === lastPoint.y) return; // No change if pointer hasn't moved to a new cell
    
    const dx = Math.abs(coords.x - lastPoint.x);
    const dy = Math.abs(coords.y - lastPoint.y);
    if (dx + dy !== 1) return; // Ensure movement is to an adjacent cell (not diagonal, not skipping)


    // Check if retracing path
    const pointIndexInPath = activePath.points.findIndex(p => p.x === coords.x && p.y === coords.y);
    if (pointIndexInPath !== -1) { 
      // Pointer moved back onto a previous point in the active path. Shorten it.
      const newPoints = activePath.points.slice(0, pointIndexInPath + 1); // Keep points up to and including the retraced point
      const clearedPathSegment = { ...activePath, points: activePath.points.slice(pointIndexInPath + 1) }; // Points to be cleared from grid
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); // Clear the part of the path that was retraced over
      
      const updatedActivePathForRetrace = { ...activePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePathForRetrace); // Redraw the shortened path

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        activePath: updatedActivePathForRetrace,
        paths: { ...prev.paths, [activePath.id]: updatedActivePathForRetrace },
      }));
      return;
    }

    // Moving to a new cell (not retracing)
    if (isMoveValid(gameState, coords.x, coords.y)) {
      const newPoints = [...activePath.points, { x: coords.x, y: coords.y }];
      const updatedActivePath = { ...activePath, points: newPoints };
      
      // Update state to reflect the new path segment being drawn
      setGameState(prev => ({
        ...prev,
        grid: updateGridWithPath(prev.grid, updatedActivePath), // Draw the new segment on the grid
        activePath: updatedActivePath, // Update the activePath in the state
        paths: { ...prev.paths, [activePath.id]: updatedActivePath }, // Update the paths collection
      }));

      // Path completion is handled by handlePointerUp when the user releases the pointer.
      // No explicit call to handlePointerUp() here.
    }
  };

  const handlePointerUp = () => {
    const currentActivePath = gameState.activePath; // Capture before setIsDrawing(false) or state changes

    if (!isDrawing || !currentActivePath) {
        setIsDrawing(false); 
        // This block handles cases like a click that set an activePath but didn't start 'drawing',
        // or if pointer up occurs without a valid drag start.
        if (currentActivePath && currentActivePath.points.length > 0 && !currentActivePath.isComplete) {
             // An incomplete path exists (e.g. single click on dot, or abandoned short drag)
             // Clear its visual representation from the grid if it's not already cleared.
             const gridWithClearedPath = updateGridWithPath(gameState.grid, currentActivePath, true);
             const updatedPathsForClear = {
                 ...gameState.paths,
                 [currentActivePath.id]: { ...currentActivePath, points: [], isComplete: false }
             };
             setGameState(prev => ({
                 ...prev,
                 grid: gridWithClearedPath,
                 paths: updatedPathsForClear,
                 activePath: null,
                 // firstClickedDotInfo should persist if this was just a single click on a dot.
                 // It's cleared on successful path, or explicitly by other logic in handlePointerDown.
             }));
        }
        return;
    }
    
    setIsDrawing(false); // End drawing mode

    const { grid } = gameState; // Grid from the state, which includes the path drawn up to the last point
    const lastPoint = currentActivePath.points[currentActivePath.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x]; // Cell where the pointer was released

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid; // By default, the grid is as is (with path drawn by handlePointerMove)

    const startPointOfActivePath = currentActivePath.points[0];
    // Check if the path ended on the correct matching dot
    const isTargetPathValidForCompletion = 
        targetCell.isDot && 
        targetCell.dot?.pairId === currentActivePath.id && 
        currentActivePath.points.length > 1 && // Path must have at least two points (start and end)
        (targetCell.dot.x !== startPointOfActivePath.x || targetCell.dot.y !== startPointOfActivePath.y); // Not the same dot

    if (isTargetPathValidForCompletion) {
      // Path completed successfully
      const completedPath = { ...currentActivePath, isComplete: true };
      updatedPaths[currentActivePath.id] = completedPath;
      updatedCompletedPairs.add(currentActivePath.id);
      setFirstClickedDotInfo(null); // Clear single-dot selection state
      // finalGrid already reflects the drawn path from handlePointerMove.
      // The updateGridWithPath in handlePointerMove took care of pathColor/pathId on cells.
    } else {
      // Path did not end on a valid target dot (e.g., lifted on empty cell, wrong dot, or same dot)
      finalGrid = updateGridWithPath(grid, currentActivePath, true); // Clear the visual path from the grid
      updatedPaths[currentActivePath.id] = { ...currentActivePath, points: [], isComplete: false }; // Reset path data
      
      // If the failed path was a drag (more than 1 point), clear firstClickedDotInfo.
      // If it was a single point path (e.g. click on a dot, then mouseup without valid connect/drag),
      // firstClickedDotInfo (set by handlePointerDown) should persist.
      if (currentActivePath.points.length > 1) {
          setFirstClickedDotInfo(null);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      paths: updatedPaths,
      activePath: null, // Always nullify activePath after pointer up
      completedPairs: updatedCompletedPairs,
    }));
  };
  
  useEffect(() => {
    if (gameState.activePath === null && !isDrawing && !firstClickedDotInfo) { // Check win only when no interaction is active
        const puzzleIsWon = checkWinCondition(gameState, puzzle.size);
        if (puzzleIsWon) {
            setShowWinModal(true);
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete();
        }
    }
  // Dependencies: check win when gameState changes, but specifically when interaction might have concluded.
  // Adding firstClickedDotInfo to dependencies to re-check if a click-connection was the last action.
  }, [gameState, puzzle.size, puzzle.difficulty, puzzle.id, onLevelComplete, isDrawing, firstClickedDotInfo]);


  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold text-primary">{puzzle.name}</h2>
      <div className="p-2 bg-card border-2 border-border rounded-lg shadow-md inline-block" style={{ touchAction: 'none' }}>
        <svg
          ref={svgRef}
          width={boardSize}
          height={boardSize}
          viewBox={`0 0 ${boardSize} ${boardSize}`}
          className="rounded select-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp} // If mouse leaves board while drawing, treat as pointer up (cancels path)
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Grid lines */}
          {Array.from({ length: puzzle.size + 1 }).map((_, i) => (
            <React.Fragment key={`gridline-${i}`}>
              <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={boardSize} stroke="hsl(var(--border))" strokeWidth="0.5" />
              <line x1={0} y1={i * CELL_SIZE} x2={boardSize} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Drawn paths (both complete and incomplete segments from gameState.paths) */}
          {Object.values(gameState.paths).map(path =>
            path.points.length > 1 && ( // Only draw if path has at least two points
              <polyline
                key={`${path.id}-path`} // Ensure unique key if path id isn't globally unique for paths vs activePath
                points={path.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={path.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={path.isComplete ? 'opacity-100' : 'opacity-70'} // Completed paths fully opaque
              />
            )
          )}
          
          {/* Active path being drawn (if different from gameState.paths representation or needs special styling) */}
          {gameState.activePath && gameState.activePath.points.length > 1 && (
             <polyline
                key={`${gameState.activePath.id}-active`}
                points={gameState.activePath.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={gameState.activePath.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50" // Active path might be slightly different opacity or animated
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
              className={cn("cursor-pointer transition-all", 
                { 
                  "ring-2 ring-offset-1 ring-foreground dark:ring-offset-background": firstClickedDotInfo?.dot.id === dot.id,
                  "opacity-50": gameState.completedPairs.has(dot.pairId) && !(firstClickedDotInfo?.dot.id === dot.id)
                }
              )}
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

