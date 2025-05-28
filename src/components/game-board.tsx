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

    // If a dot is clicked
    if (cell.isDot && cell.dot) {
        const clickedDot = cell.dot;

        if (gameState.completedPairs.has(clickedDot.pairId)) {
            setFirstClickedDotInfo(null);
            setIsDrawing(false);
            return;
        }

        if (firstClickedDotInfo) { // A dot was already selected
            if (clickedDot.pairId === firstClickedDotInfo.dot.pairId && clickedDot.id !== firstClickedDotInfo.dot.id) { // Clicked matching pair
                const prevDotCoords = firstClickedDotInfo.cellCoords;
                const dx = Math.abs(coords.x - prevDotCoords.x);
                const dy = Math.abs(coords.y - prevDotCoords.y);

                if (dx + dy === 1) { // Dots are adjacent - Attempt direct connection
                    const tempActivePathForValidation: DrawnPath = {
                        id: clickedDot.pairId,
                        color: clickedDot.color,
                        points: [prevDotCoords],
                        isComplete: false,
                    };
                    const tempGameStateForValidation = { ...gameState, activePath: tempActivePathForValidation };

                    if (isMoveValid(tempGameStateForValidation, coords.x, coords.y)) {
                        let newGrid = gameState.grid;
                        const existingPath = gameState.paths[clickedDot.pairId];
                        if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                            newGrid = updateGridWithPath(newGrid, existingPath, true);
                        }

                        const finalClickedPath: DrawnPath = {
                            id: clickedDot.pairId,
                            color: clickedDot.color,
                            points: [prevDotCoords, coords],
                            isComplete: true,
                        };
                        newGrid = updateGridWithPath(newGrid, finalClickedPath);

                        const updatedPaths = { ...gameState.paths, [clickedDot.pairId]: finalClickedPath };
                        const updatedCompletedPairs = new Set(gameState.completedPairs).add(clickedDot.pairId);

                        setGameState(prev => ({
                            ...prev,
                            grid: newGrid,
                            paths: updatedPaths,
                            activePath: null,
                            completedPairs: updatedCompletedPairs,
                        }));
                        setFirstClickedDotInfo(null);
                        setIsDrawing(false);
                        return; 
                    } else {
                        setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                    }
                } else {
                    setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                }
            } else if (clickedDot.id === firstClickedDotInfo.dot.id) { // Clicked the same dot again
                setFirstClickedDotInfo(null);
                setIsDrawing(false);
                if (gameState.activePath && gameState.activePath.id === clickedDot.pairId) {
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
                setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
            }
        } else { 
            setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
        }

        // Standard drag logic initiation:
        // If a path wasn't completed by click-to-connect, this click might start a drag.
        if (!gameState.completedPairs.has(clickedDot.pairId)) {
            let newGrid = gameState.grid;
            const existingPath = gameState.paths[clickedDot.pairId];
            // Clear previous incomplete path for this color if starting a new drag from its start/different dot
            if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                 const isRestartingSamePath = existingPath.points[0]?.x === coords.x && existingPath.points[0]?.y === coords.y;
                 if (!isRestartingSamePath || (firstClickedDotInfo && firstClickedDotInfo.dot.id !== clickedDot.id)) {
                    newGrid = updateGridWithPath(newGrid, existingPath, true);
                 }
            }
            
            const newActivePath: DrawnPath = {
                id: clickedDot.pairId,
                color: clickedDot.color,
                points: [{ x: coords.x, y: coords.y }],
                isComplete: false,
            };
            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(newGrid, newActivePath),
                activePath: newActivePath,
                paths: { ...prev.paths, [clickedDot.pairId]: newActivePath },
            }));
            setIsDrawing(true);
        }

    } else { // Clicked on a non-dot cell
        setFirstClickedDotInfo(null); 
        setIsDrawing(false); 
    }
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !gameState.activePath) return;
    event.preventDefault();
    
    const coords = getCellCoordinates(event);
    if (!coords) return;

    const { activePath } = gameState;
    const lastPoint = activePath.points[activePath.points.length - 1];

    if (coords.x === lastPoint.x && coords.y === lastPoint.y) return;
    
    const dx = Math.abs(coords.x - lastPoint.x);
    const dy = Math.abs(coords.y - lastPoint.y);
    if (dx + dy !== 1) return; 


    const pointIndexInPath = activePath.points.findIndex(p => p.x === coords.x && p.y === coords.y);
    if (pointIndexInPath !== -1) { 
      const newPoints = activePath.points.slice(0, pointIndexInPath +1 );
      const clearedPathSegment = { ...activePath, points: activePath.points.slice(pointIndexInPath + 1) };
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); 
      
      const updatedActivePath = { ...activePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePath); 

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

      const targetCell = gameState.grid[coords.y][coords.x];
      if (targetCell.isDot && targetCell.dot?.pairId === activePath.id && targetCell.dot.color === activePath.color) {
         handlePointerUp(); 
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !gameState.activePath) {
        // If not drawing but a dot was clicked (for click-to-connect attempt that didn't complete)
        // we don't necessarily want to clear firstClickedDotInfo here, user might click second dot next.
        // setIsDrawing(false) should be sufficient.
        setIsDrawing(false);
        return;
    }
    
    setIsDrawing(false);
    // `firstClickedDotInfo` is not reset here, allowing for a subsequent click to attempt connection.
    // It's reset if a path is successfully made by click, or if a non-dot is clicked, or same dot is re-clicked.

    const { activePath, grid } = gameState;
    const lastPoint = activePath.points[activePath.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x];

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid;

    if (targetCell.isDot && targetCell.dot?.pairId === activePath.id && activePath.points.length > 1) {
      const completedPath = { ...activePath, isComplete: true };
      updatedPaths[activePath.id] = completedPath;
      updatedCompletedPairs.add(activePath.id);
      setFirstClickedDotInfo(null); // Path completed, clear selection
    } else {
      finalGrid = updateGridWithPath(grid, activePath, true); 
      updatedPaths[activePath.id] = { ...activePath, points: [], isComplete: false }; 
      // Don't clear firstClickedDotInfo here if path was invalid. User might be trying to correct.
      // Or, if the activePath had only one point (just the start dot after a click), and drag was invalid,
      // keep firstClickedDotInfo selected.
      if (activePath.points.length <=1) {
        // if path was just a single point and pointer up happened, it implies an invalid drag start or tap.
        // if firstClickedDotInfo matches this single point, keep it. Otherwise clear.
        if(!(firstClickedDotInfo && firstClickedDotInfo.cellCoords.x === activePath.points[0]?.x && firstClickedDotInfo.cellCoords.y === activePath.points[0]?.y)){
            //This case implies something went wrong, or a drag started from a point not matching firstClickedDotInfo.
            //For safety, if firstClickedDotInfo is not the start of this failed path, clear it.
             setFirstClickedDotInfo(null);
        }
      } else {
        // For longer invalid paths, it's probably better to clear firstClickedDotInfo
        // so the user isn't stuck in a "half-selected" state for click-connect
        // if they attempt a drag that fails.
        // However, the current design is that firstClickedDotInfo is mainly for the *start* of an action.
        // If a drag has occurred, firstClickedDotInfo's role for the *next* click is more relevant.
        // Let's clear it if an invalid multi-point path is lifted.
         setFirstClickedDotInfo(null);
      }


    }
    
    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      paths: updatedPaths,
      activePath: null,
      completedPairs: updatedCompletedPairs,
    }));
  };
  
  useEffect(() => {
    // Check win only when no path is being actively drawn AND no dot is singly clicked for connection
    if (gameState.activePath === null && !isDrawing) {
        const puzzleIsWon = checkWinCondition(gameState, puzzle.size);
        if (puzzleIsWon) {
            setShowWinModal(true);
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete();
        }
    }
  }, [gameState, puzzle.size, puzzle.difficulty, puzzle.id, onLevelComplete, isDrawing]);


  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold text-primary">{puzzle.name}</h2>
      <div className="p-2 bg-card border-2 border-border rounded-lg shadow-md inline-block" style={{ touchAction: 'none' }}>
        <svg
          ref={svgRef}
          width={boardSize}
          height={boardSize}
          viewBox={`0 0 ${boardSize} ${boardSize}`}
          className="rounded select-none" // Added select-none to prevent text selection during drag
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp} 
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {Array.from({ length: puzzle.size + 1 }).map((_, i) => (
            <React.Fragment key={`gridline-${i}`}>
              <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={boardSize} stroke="hsl(var(--border))" strokeWidth="0.5" />
              <line x1={0} y1={i * CELL_SIZE} x2={boardSize} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
            </React.Fragment>
          ))}

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
