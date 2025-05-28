
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

const CELL_SIZE = 50; 
const DOT_RADIUS_PERCENT = 0.35; 
const LINE_WIDTH_PERCENT = 0.2; 

export default function GameBoard({ 
  puzzle, 
  onLevelComplete, 
  onNextLevel, 
  currentLevelIndex, 
  totalLevelsInDifficulty 
}: GameBoardProps) {
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
    if (showWinModal) return; 

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
                        if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                            const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                            setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                        }
                    }
                } else {
                    setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                     if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                        const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                        setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                    }
                }
            } else if (clickedDot.id === firstClickedDotInfo.dot.id) { 
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
                 if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){
                    const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                    setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                }
            }
        } else { 
            setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
        }

        if (!gameState.completedPairs.has(clickedDot.pairId)) {
            let newGrid = gameState.grid;
            const existingPath = gameState.paths[clickedDot.pairId];
            
            if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                 newGrid = updateGridWithPath(newGrid, existingPath, true); 
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

    } else { 
        setFirstClickedDotInfo(null); 
        setIsDrawing(false); 
        if (gameState.activePath) { 
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
    if (!isDrawing || !gameState.activePath || showWinModal) return;
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
      const newPoints = activePath.points.slice(0, pointIndexInPath + 1); 
      const clearedPathSegment = { ...activePath, points: activePath.points.slice(pointIndexInPath + 1) }; 
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); 
      
      const updatedActivePathForRetrace = { ...activePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePathForRetrace); 

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        activePath: updatedActivePathForRetrace,
        paths: { ...prev.paths, [activePath.id]: updatedActivePathForRetrace },
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
    }
  };

  const handlePointerUp = () => {
    const currentActivePath = gameState.activePath; 
    if (showWinModal) return;

    if (!isDrawing || !currentActivePath) {
        setIsDrawing(false); 
        if (currentActivePath && currentActivePath.points.length > 0 && !currentActivePath.isComplete) {
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
             }));
        }
        return;
    }
    
    setIsDrawing(false); 

    const { grid } = gameState; 
    const lastPoint = currentActivePath.points[currentActivePath.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x]; 

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid; 

    const startPointOfActivePath = currentActivePath.points[0];
    const isTargetPathValidForCompletion = 
        targetCell.isDot && 
        targetCell.dot?.pairId === currentActivePath.id && 
        currentActivePath.points.length > 1 && 
        (targetCell.dot.x !== startPointOfActivePath.x || targetCell.dot.y !== startPointOfActivePath.y); 

    if (isTargetPathValidForCompletion) {
      const completedPath = { ...currentActivePath, isComplete: true };
      updatedPaths[currentActivePath.id] = completedPath;
      updatedCompletedPairs.add(currentActivePath.id);
      finalGrid = updateGridWithPath(grid, completedPath); 
      setFirstClickedDotInfo(null); 
    } else {
      finalGrid = updateGridWithPath(grid, currentActivePath, true); 
      updatedPaths[currentActivePath.id] = { ...currentActivePath, points: [], isComplete: false }; 
      
      if (currentActivePath.points.length > 1) {
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
    if (!isDrawing && !gameState.activePath && !firstClickedDotInfo && !showWinModal) {
        const puzzleIsWon = checkWinCondition(gameState, puzzle);
        if (puzzleIsWon) {
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete();
            setShowWinModal(true);
        }
    }
  }, [gameState, puzzle, onLevelComplete, isDrawing, firstClickedDotInfo, showWinModal]);


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
          onMouseLeave={handlePointerUp} 
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

          {/* Drawn paths */}
          {Object.values(gameState.paths).map(path =>
            path.points.length > 1 && ( 
              <polyline
                key={`${path.id}-path`}
                points={path.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={path.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-opacity", path.isComplete ? 'opacity-100' : 'opacity-70')}
              />
            )
          )}
          
          {/* Active path being drawn */}
          {gameState.activePath && gameState.activePath.points.length > 0 && ( 
             <polyline
                key={`${gameState.activePath.id}-active`}
                points={gameState.activePath.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={gameState.activePath.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50" 
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
                  "ring-2 ring-offset-2 ring-foreground dark:ring-offset-background": firstClickedDotInfo?.dot.id === dot.id,
                  "opacity-60": gameState.completedPairs.has(dot.pairId) && !(firstClickedDotInfo?.dot.id === dot.id)
                }
              )}
              data-dot-id={dot.id}
            />
          ))}
        </svg>
      </div>
      <Button onClick={resetBoard} variant="outline" disabled={showWinModal}>
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
