
"use client";

import type { PuzzleData, GameState, DrawnPath, Dot, FlowData } from '@/types';
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
  const activePathRef = useRef<DrawnPath | null>(null);
  
  const [firstClickedDotInfo, setFirstClickedDotInfo] = useState<{ dot: { id: string; x: number; y: number; color: string; pairId: string; }, cellCoords: {x: number, y: number} } | null>(null);


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
    activePathRef.current = null; 
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
    if (showWinModal || hintData.path) return;

    const coords = getCellCoordinates(event);
    if (!coords) return;

    const cell = gameState.grid[coords.y][coords.x];

    if (cell.isDot && cell.dot) {
        const clickedDot = cell.dot; // cell.dot includes pairId
        
        if (gameState.completedPairs.has(clickedDot.pairId)) {
            setFirstClickedDotInfo(null);
            setIsDrawing(false);
            activePathRef.current = null;
            return;
        }

        if (firstClickedDotInfo) { 
            if (clickedDot.pairId === firstClickedDotInfo.dot.pairId && clickedDot.id !== firstClickedDotInfo.dot.id) {
                // This is a click on the matching pair dot
                const prevDotCoords = firstClickedDotInfo.cellCoords;
                const dx = Math.abs(coords.x - prevDotCoords.x);
                const dy = Math.abs(coords.y - prevDotCoords.y);

                if (dx + dy === 1) { // Dots are adjacent
                    // Create a temporary activePath for validation
                    const tempActivePathForValidation: DrawnPath = {
                        id: clickedDot.pairId,
                        color: clickedDot.color, // Color from the clicked dot
                        points: [prevDotCoords], 
                        isComplete: false,
                    };
                    
                    // Check if move to the second dot is valid (e.g., not blocked)
                    // For click-to-connect, we assume if they are adjacent, it's valid if the cell is the dot itself.
                    // isMoveValid needs to be adapted slightly or this check made more direct.
                    // For now, let's assume adjacency implies validity for click-to-connect.

                    let newGrid = gameState.grid;
                    // Clear any existing incomplete path for this pair from the grid
                    const existingPath = gameState.paths[clickedDot.pairId];
                    if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                        newGrid = updateGridWithPath(newGrid, existingPath, true); 
                    }
                    
                    const finalClickedPath: DrawnPath = {
                        id: clickedDot.pairId,
                        color: clickedDot.color, // Use color from dot
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
                    activePathRef.current = null;
                    setFirstClickedDotInfo(null); 
                    setIsDrawing(false);
                    return; 
                } else {
                    // Clicked on pair, but not adjacent - treat as new selection
                    setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                    // Clear previous active path if it was for a different pair
                     if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){ 
                        const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                        setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                        activePathRef.current = null;
                     }
                }
            } else if (clickedDot.id === firstClickedDotInfo.dot.id) {
                // Clicked the same dot again - deselect
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
                    activePathRef.current = null;
                }
                return;
            } else {
                // Clicked a different dot (not the pair of the currently selected one)
                setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
                 if(gameState.activePath && gameState.activePath.id !== clickedDot.pairId){ 
                    const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                    setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                    activePathRef.current = null;
                 }
            }
        } else {
            // No dot was previously clicked, or starting a new selection
            setFirstClickedDotInfo({ dot: clickedDot, cellCoords: coords });
        }

        // Common logic for starting a drag or new active path if not completed by click
        if (!gameState.completedPairs.has(clickedDot.pairId)) { 
            let newGrid = gameState.grid;
            const existingPath = gameState.paths[clickedDot.pairId];
            
            if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                 newGrid = updateGridWithPath(newGrid, existingPath, true); 
            }

            const flowData = puzzle.flows.find(f => f.pairId === clickedDot.pairId);
            if (!flowData) return; // Should not happen if puzzle data is correct

            const newActivePath: DrawnPath = {
                id: clickedDot.pairId,
                color: flowData.color, // Use color from flowData for consistency
                points: [{ x: coords.x, y: coords.y }],
                isComplete: false,
            };
            activePathRef.current = newActivePath; // Set ref
            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(newGrid, newActivePath), 
                activePath: newActivePath,
                paths: { ...prev.paths, [clickedDot.pairId]: newActivePath }, 
            }));
            setIsDrawing(true); 
        }

    } else { 
        // Clicked on an empty cell
        setFirstClickedDotInfo(null); 
        setIsDrawing(false); 
        if (gameState.activePath) { // If there was an active path being drawn
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
        activePathRef.current = null; // Clear ref
    }
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !activePathRef.current || showWinModal || hintData.path) return; // Use ref
    event.preventDefault();

    const coords = getCellCoordinates(event);
    if (!coords) return;

    const currentActivePath = activePathRef.current; // Use ref
    const lastPoint = currentActivePath.points[currentActivePath.points.length - 1];

    if (coords.x === lastPoint.x && coords.y === lastPoint.y) return; 

    const dx = Math.abs(coords.x - lastPoint.x);
    const dy = Math.abs(coords.y - lastPoint.y);
    if (dx + dy !== 1) return; 

    const pointIndexInPath = currentActivePath.points.findIndex(p => p.x === coords.x && p.y === coords.y);
    if (pointIndexInPath !== -1) { 
      const newPoints = currentActivePath.points.slice(0, pointIndexInPath + 1);
      const clearedPathSegment = { ...currentActivePath, points: currentActivePath.points.slice(pointIndexInPath + 1) };
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); 

      const updatedActivePathForRetrace = { ...currentActivePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePathForRetrace); 
      activePathRef.current = updatedActivePathForRetrace; // Update ref

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        activePath: updatedActivePathForRetrace,
        paths: { ...prev.paths, [currentActivePath.id]: updatedActivePathForRetrace },
      }));
      return;
    }

    // Check if moving onto the target dot
    const targetCell = gameState.grid[coords.y][coords.x];
    if (targetCell.isDot && targetCell.dot?.pairId === currentActivePath.id) {
        const startDotOfActivePath = currentActivePath.points[0];
        const targetDotDefinition = puzzle.flows
            .find(f => f.pairId === currentActivePath.id)?.dots
            .find(d => d.x === targetCell.x && d.y === targetCell.y);

        if (targetDotDefinition && (targetDotDefinition.x !== startDotOfActivePath.x || targetDotDefinition.y !== startDotOfActivePath.y)) {
            // Moving onto the correct pair dot
            const newPoints = [...currentActivePath.points, { x: coords.x, y: coords.y }];
            const updatedActivePath = { ...currentActivePath, points: newPoints };
            activePathRef.current = updatedActivePath; // Update ref

            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(prev.grid, updatedActivePath),
                activePath: updatedActivePath,
                paths: { ...prev.paths, [currentActivePath.id]: updatedActivePath },
            }));
            return; 
        }
    }
    
    // Standard move validation for non-dot cells or incorrect dots
    // Pass gameState and the current path from ref to isMoveValid
    const tempGameStateForValidation = {...gameState, activePath: currentActivePath };
    if (isMoveValid(tempGameStateForValidation, coords.x, coords.y)) {
      const newPoints = [...currentActivePath.points, { x: coords.x, y: coords.y }];
      const updatedActivePath = { ...currentActivePath, points: newPoints };
      activePathRef.current = updatedActivePath; // Update ref

      setGameState(prev => ({
        ...prev,
        grid: updateGridWithPath(prev.grid, updatedActivePath),
        activePath: updatedActivePath,
        paths: { ...prev.paths, [currentActivePath.id]: updatedActivePath },
      }));
    }
  };

  const handlePointerUp = () => {
    const currentActivePathFromRef = activePathRef.current; // Use ref
    
    if (showWinModal || hintData.path) return;

    if (!isDrawing || !currentActivePathFromRef) {
        setIsDrawing(false); 
        // If there was an active path in state (e.g. from a click that didn't start a drag but set activePath)
        // and it wasn't completed, this logic might still be needed.
        // However, isDrawing should align with activePathRef.current.
        if (gameState.activePath && gameState.activePath.points.length > 0 && !gameState.activePath.isComplete && !currentActivePathFromRef) {
             const gridWithClearedPath = updateGridWithPath(gameState.grid, gameState.activePath, true);
             const updatedPathsForClear = {
                 ...gameState.paths,
                 [gameState.activePath.id]: { ...gameState.activePath, points: [], isComplete: false }
             };
             setGameState(prev => ({
                 ...prev,
                 grid: gridWithClearedPath,
                 paths: updatedPathsForClear,
                 activePath: null, 
             }));
        }
        activePathRef.current = null; // Clear ref
        return;
    }

    setIsDrawing(false); 

    const { grid } = gameState; // grid state should be current enough for cell properties like isDot
    const lastPoint = currentActivePathFromRef.points[currentActivePathFromRef.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x];

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid;

    const startPointOfActivePath = currentActivePathFromRef.points[0];
    const targetDotData = puzzle.flows
                            .find(f => f.pairId === currentActivePathFromRef.id)?.dots
                            .find(d => d.x === targetCell.x && d.y === targetCell.y);

    const isTargetPathValidForCompletion =
        targetCell.isDot &&
        targetDotData && 
        targetDotData.pairId === currentActivePathFromRef.id && 
        currentActivePathFromRef.points.length > 1 && 
        (targetDotData.x !== startPointOfActivePath.x || targetDotData.y !== startPointOfActivePath.y); 

    if (isTargetPathValidForCompletion) {
      const completedPath = { ...currentActivePathFromRef, isComplete: true };
      updatedPaths[currentActivePathFromRef.id] = completedPath;
      updatedCompletedPairs.add(currentActivePathFromRef.id);
      finalGrid = updateGridWithPath(grid, completedPath); 
      setFirstClickedDotInfo(null); 
    } else {
      finalGrid = updateGridWithPath(grid, currentActivePathFromRef, true); 
      updatedPaths[currentActivePathFromRef.id] = { ...currentActivePathFromRef, points: [], isComplete: false }; 
      // Do not clear firstClickedDotInfo here, allow click-to-connect to manage it
    }
    
    activePathRef.current = null; // Path processed, clear ref

    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      paths: updatedPaths,
      activePath: null, // Clear activePath from state
      completedPairs: updatedCompletedPairs,
    }));
  };

  useEffect(() => {
    // Win condition check should use the latest gameState
    if (!isDrawing && !activePathRef.current && !firstClickedDotInfo && !showWinModal && !hintData.path) {
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

    const incompleteFlows = puzzle.flows.filter(
      flow => !gameState.completedPairs.has(flow.pairId)
    );

    if (incompleteFlows.length === 0) {
      return; 
    }

    // If there's an active path being drawn by the user, clear it first.
    if (activePathRef.current) {
        const currentDrawingPath = activePathRef.current;
        const gridWithClearedUserPath = updateGridWithPath(gameState.grid, currentDrawingPath, true);
        setGameState(prev => ({
            ...prev,
            grid: gridWithClearedUserPath,
            paths: {
                ...prev.paths,
                [currentDrawingPath.id]: { ...currentDrawingPath, points: [], isComplete: false }
            },
            activePath: null,
        }));
        activePathRef.current = null;
        setIsDrawing(false);
        setFirstClickedDotInfo(null); // Clear any partial click selection
    }


    setRemainingHints(prev => prev - 1);

    const randomFlowIndex = Math.floor(Math.random() * incompleteFlows.length);
    const flowToHint = incompleteFlows[randomFlowIndex];

    if (!flowToHint.solutionPath || flowToHint.solutionPath.length < 2) {
      console.error("Selected flow for hint has no valid solution path in puzzle data.");
      setRemainingHints(prev => prev + 1); // Restore hint if data is bad
      return;
    }

    // Clear any existing path for the flow that's about to be hinted
    const existingPathForHintedFlow = gameState.paths[flowToHint.pairId];
    let gridBeforeHint = gameState.grid;
    if (existingPathForHintedFlow && existingPathForHintedFlow.points.length > 0 && !existingPathForHintedFlow.isComplete) {
        gridBeforeHint = updateGridWithPath(gameState.grid, existingPathForHintedFlow, true);
        setGameState(prev => ({
            ...prev,
            grid: gridBeforeHint,
            paths: {
                ...prev.paths,
                [flowToHint.pairId]: { ...existingPathForHintedFlow, points: [], isComplete: false }
            }
        }));
    }


    setHintData({
      path: { 
        id: flowToHint.pairId,
        color: flowToHint.color,
        points: flowToHint.solutionPath, 
        isComplete: false, // Hint path is temporary, not a game completion
      },
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
        const numberOfSegments = pointsToAnimate.length -1; 
        const delayPerSegment = HINT_ANIMATION_DURATION / numberOfSegments;

        animationTimer = setTimeout(() => {
          setHintData(prev => {
            if (!prev.path) return prev; 
            const nextPointIndex = prev.visiblePoints.length;
            if (nextPointIndex < prev.path.points.length) {
              const nextPoint = prev.path.points[nextPointIndex];
              return { ...prev, visiblePoints: [...prev.visiblePoints, nextPoint] };
            }
            return prev; 
          });
        }, delayPerSegment);
      }
    } else if (hintData.path && hintData.visiblePoints.length > 0 && hintData.visiblePoints.length === hintData.path.points.length) {
      // All points of the hint path are now visible
      hideTimer = setTimeout(() => {
        setHintData({ path: null, visiblePoints: [] }); // Clear hint after visible duration
      }, HINT_VISIBLE_DURATION);
    }

    return () => {
      if (animationTimer) clearTimeout(animationTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [hintData]);


  const allPairsCompleted = puzzle.flows.every(flow => gameState.completedPairs.has(flow.pairId));

  return (
    <div className="flex flex-col items-center space-y-4 pb-20 md:pb-0">
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

          {/* Drawn paths (from gameState.paths) */}
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

          {/* Actively drawing path (from gameState.activePath for visual feedback) */}
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

          {/* Hint path animation */}
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
          {puzzle.flows.flatMap(flow => flow.dots.map(dot => {
            // Get the cell.dot information for consistent pairId access
            const cellDotInfo = gameState.grid[dot.y]?.[dot.x]?.dot;
            const dotPairId = cellDotInfo?.pairId || flow.pairId; // Fallback to flow.pairId if needed

            return (
              <circle
                key={dot.id}
                cx={dot.x * CELL_SIZE + CELL_SIZE / 2}
                cy={dot.y * CELL_SIZE + CELL_SIZE / 2}
                r={CELL_SIZE * DOT_RADIUS_PERCENT}
                fill={dot.color} // Use the dot's specific color for rendering
                className={cn(
                  "cursor-pointer transition-all duration-150",
                  {
                    "opacity-30": hintData.path && hintData.path.id !== dotPairId,
                    "opacity-100": !hintData.path || hintData.path.id === dotPairId, // Full opacity if no hint or part of hint
                    
                    "ring-2 ring-offset-2 ring-foreground dark:ring-offset-background":
                      !hintData.path && firstClickedDotInfo?.dot.id === dot.id,
                    
                    "opacity-60": 
                      !hintData.path &&
                      gameState.completedPairs.has(dotPairId) &&
                      !(firstClickedDotInfo?.dot.id === dot.id)
                  }
                )}
                data-dot-id={dot.id} 
              />
            );
          }))}
        </svg>
      </div>
      <div className={cn(
        "flex space-x-3 justify-center", 
        "fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-10", 
        "md:relative md:mt-4 md:p-0 md:bg-transparent md:border-none md:z-auto" 
      )}>
        <Button onClick={resetBoard} variant="outline" disabled={showWinModal || !!hintData.path}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
        </Button>
        <Button
          onClick={handleHint}
          variant="outline"
          disabled={remainingHints <= 0 || showWinModal || !!hintData.path || allPairsCompleted}
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

