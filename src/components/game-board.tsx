
"use client";

import type { PuzzleData, GridCellData, GameState, DrawnPath, Dot } from '@/types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeGameState, isMoveValid, updateGridWithPath, checkWinCondition } from '@/lib/game-logic';
import { Button } from '@/components/ui/button';
import { RotateCcw, Lightbulb } from 'lucide-react';
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
const MAX_HINTS = 3;
const HINT_ANIMATION_DURATION = 600; // ms
const HINT_VISIBLE_DURATION = 1000; // ms

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
  
  const [remainingHints, setRemainingHints] = useState(MAX_HINTS);
  const [hintData, setHintData] = useState<{ path: DrawnPath | null; visiblePoints: { x: number; y: number }[] }>({
    path: null,
    visiblePoints: [],
  });

  const boardSize = puzzle.size * CELL_SIZE;

  const resetBoard = useCallback(() => {
    setGameState(initializeGameState(puzzle));
    setShowWinModal(false);
    setFirstClickedDotInfo(null);
    setIsDrawing(false);
    setRemainingHints(MAX_HINTS);
    setHintData({ path: null, visiblePoints: [] });
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
    if (showWinModal || hintData.path) return; // Prevent interaction during hint

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
    if (!isDrawing || !gameState.activePath || showWinModal || hintData.path) return;
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

    const targetCell = gameState.grid[coords.y][coords.x];
    if (targetCell.isDot && targetCell.dot?.pairId === activePath.id) {
        const newPoints = [...activePath.points, { x: coords.x, y: coords.y }];
        const updatedActivePath = { ...activePath, points: newPoints };
        setGameState(prev => ({
            ...prev,
            grid: updateGridWithPath(prev.grid, updatedActivePath),
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
    }
  };

  const handlePointerUp = () => {
    const currentActivePath = gameState.activePath; 
    if (showWinModal || hintData.path) return;

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
    if (!isDrawing && !gameState.activePath && !firstClickedDotInfo && !showWinModal && !hintData.path) {
        const puzzleIsWon = checkWinCondition(gameState, puzzle);
        if (puzzleIsWon) {
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete();
            setShowWinModal(true);
        }
    }
  }, [gameState, puzzle, onLevelComplete, isDrawing, firstClickedDotInfo, showWinModal, hintData.path]);


  const handleHint = () => {
    if (remainingHints <= 0 || hintData.path || showWinModal || allPairsCompleted) return;

    const incompletePairIds = puzzle.dots
      .map(dot => dot.pairId)
      .filter((pairId, index, self) => 
        self.indexOf(pairId) === index && !gameState.completedPairs.has(pairId)
      );

    if (incompletePairIds.length === 0) {
      return; 
    }

    setRemainingHints(prev => prev - 1);

    const randomPairId = incompletePairIds[Math.floor(Math.random() * incompletePairIds.length)];
    const pairDots = puzzle.dots.filter(dot => dot.pairId === randomPairId);
    if (pairDots.length !== 2) return;

    const [dot1, dot2] = pairDots;
    const hintPathPoints: { x: number; y: number }[] = [];
    
    // Assuming straight lines for current puzzles
    if (dot1.x === dot2.x) { // Vertical line
      const startY = Math.min(dot1.y, dot2.y);
      const endY = Math.max(dot1.y, dot2.y);
      for (let y = startY; y <= endY; y++) {
        hintPathPoints.push({ x: dot1.x, y });
      }
    } else if (dot1.y === dot2.y) { // Horizontal line
      const startX = Math.min(dot1.x, dot2.x);
      const endX = Math.max(dot1.x, dot2.x);
      for (let x = startX; x <= endX; x++) {
        hintPathPoints.push({ x, y: dot1.y });
      }
    } else {
        // This case should ideally not happen with current puzzle generation (all straight lines)
        // If puzzles become complex, this part needs advanced pathfinding.
        console.error("Hint logic error: Dots are not aligned for a simple path. Advanced pathfinding needed for complex puzzles.");
        // As a fallback for complex puzzles if they existed, just connect the two dots directly for the hint.
        // For now, this won't be reached with current puzzle designs.
        // hintPathPoints.push({ x: dot1.x, y: dot1.y });
        // hintPathPoints.push({ x: dot2.x, y: dot2.y });
        return; // Or handle error more gracefully
    }
    
    if (hintPathPoints.length === 0) return;

    setHintData({
      path: { id: randomPairId, color: dot1.color, points: hintPathPoints, isComplete: false },
      visiblePoints: [],
    });
  };

  useEffect(() => {
    let animationTimer: NodeJS.Timeout | undefined;
    let hideTimer: NodeJS.Timeout | undefined;

    if (hintData.path && hintData.visiblePoints.length < hintData.path.points.length) {
      const pointsToAnimate = hintData.path.points;
      const currentVisibleCount = hintData.visiblePoints.length;

      if (pointsToAnimate.length <= 1) { 
        setHintData(prev => ({ ...prev, visiblePoints: pointsToAnimate }));
        return;
      }
      
      if (currentVisibleCount === 0) {
        setHintData(prev => ({ ...prev, visiblePoints: [pointsToAnimate[0]] }));
      } else {
        const numberOfSegments = pointsToAnimate.length - 1;
        const delayPerSegment = HINT_ANIMATION_DURATION / numberOfSegments;

        animationTimer = setTimeout(() => {
          setHintData(prev => {
            if (!prev.path) return prev; 
            const nextPoint = prev.path.points[prev.visiblePoints.length];
            if (nextPoint) {
              return { ...prev, visiblePoints: [...prev.visiblePoints, nextPoint] };
            }
            return prev;
          });
        }, delayPerSegment);
      }
    } else if (hintData.path && hintData.visiblePoints.length > 0 && hintData.visiblePoints.length === hintData.path.points.length) {
      hideTimer = setTimeout(() => {
        setHintData({ path: null, visiblePoints: [] });
      }, HINT_VISIBLE_DURATION);
    }

    return () => {
      if (animationTimer) clearTimeout(animationTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [hintData]);


  const allPairsCompleted = puzzle.dots
    .map(d => d.pairId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .every(pairId => gameState.completedPairs.has(pairId));


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

          {/* Animated Hint Path */}
          {hintData.path && hintData.visiblePoints.length > 0 && (
            <polyline
              key="hint-path-animation"
              points={hintData.visiblePoints.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
              fill="none"
              stroke={hintData.path.color} 
              strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT * 0.7} 
              strokeDasharray="3 3" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none opacity-90" 
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
              className={cn(
                "cursor-pointer transition-all duration-150", 
                { 
                  // Hint-specific styling (takes precedence)
                  "opacity-30": hintData.path && hintData.path.id !== dot.pairId,
                  // "opacity-100": hintData.path && hintData.path.id === dot.pairId, // Default, no explicit class needed if not dimmed

                  // Styling when no hint is active
                  "ring-2 ring-offset-2 ring-foreground dark:ring-offset-background":
                    !hintData.path && firstClickedDotInfo?.dot.id === dot.id,
                  "opacity-60":
                    !hintData.path &&
                    gameState.completedPairs.has(dot.pairId) &&
                    !(firstClickedDotInfo?.dot.id === dot.id)
                }
              )}
              data-dot-id={dot.id}
            />
          ))}
        </svg>
      </div>
      <div className="flex space-x-3">
        <Button onClick={resetBoard} variant="outline" disabled={showWinModal || !!hintData.path}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
        </Button>
        <Button 
          onClick={handleHint} 
          variant="outline" 
          disabled={showWinModal || allPairsCompleted || remainingHints === 0 || !!hintData.path}
        >
          <Lightbulb className="mr-2 h-4 w-4" /> Hint ({remainingHints})
        </Button>
      </div>
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

    