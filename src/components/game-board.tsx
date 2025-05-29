
"use client";

import type { PuzzleData, GameState, DrawnPath, Dot, FlowData } from '@/types'; // Added FlowData
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
  
  // For click-to-connect logic: stores info about the first dot clicked.
  // The dot object here needs its pairId to identify its partner.
  const [firstClickedDotInfo, setFirstClickedDotInfo] = useState<{ dot: Dot & {pairId: string}, cellCoords: {x: number, y: number} } | null>(null);


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
    if (showWinModal || hintData.path) return;

    const coords = getCellCoordinates(event);
    if (!coords) return;

    const cell = gameState.grid[coords.y][coords.x];

    if (cell.isDot && cell.dot) {
        const clickedDot = cell.dot; // This is a Dot from types.ts
        // We need pairId for the clickedDot. It should be available via cell.dot.pairId (added in game-logic initializeGameState)
        const clickedDotPairId = puzzle.flows.find(f => f.dots.some(d => d.id === clickedDot.id))?.pairId;

        if (!clickedDotPairId) {
          console.error("Clicked dot has no pairId!");
          return;
        }
        
        const dotWithPairId = { ...clickedDot, pairId: clickedDotPairId };


        if (gameState.completedPairs.has(dotWithPairId.pairId)) {
            setFirstClickedDotInfo(null);
            setIsDrawing(false);
            return;
        }

        if (firstClickedDotInfo) { // A dot was already selected
            if (dotWithPairId.pairId === firstClickedDotInfo.dot.pairId && dotWithPairId.id !== firstClickedDotInfo.dot.id) {
                // Clicked the matching pair dot
                const prevDotCoords = firstClickedDotInfo.cellCoords;
                const dx = Math.abs(coords.x - prevDotCoords.x);
                const dy = Math.abs(coords.y - prevDotCoords.y);

                if (dx + dy === 1) { // Adjacent cells only
                    const tempActivePathForValidation: DrawnPath = {
                        id: dotWithPairId.pairId,
                        color: dotWithPairId.color,
                        points: [prevDotCoords], // Start from the first clicked dot
                        isComplete: false,
                    };
                    const tempGameStateForValidation = { ...gameState, activePath: tempActivePathForValidation };

                    if (isMoveValid(tempGameStateForValidation, coords.x, coords.y)) {
                        let newGrid = gameState.grid;
                        const existingPath = gameState.paths[dotWithPairId.pairId];
                        if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                            newGrid = updateGridWithPath(newGrid, existingPath, true); // Clear old path
                        }
                        
                        const finalClickedPath: DrawnPath = {
                            id: dotWithPairId.pairId,
                            color: dotWithPairId.color,
                            points: [prevDotCoords, coords], // Path between the two clicked dots
                            isComplete: true,
                        };
                        newGrid = updateGridWithPath(newGrid, finalClickedPath);

                        const updatedPaths = { ...gameState.paths, [dotWithPairId.pairId]: finalClickedPath };
                        const updatedCompletedPairs = new Set(gameState.completedPairs).add(dotWithPairId.pairId);

                        setGameState(prev => ({
                            ...prev,
                            grid: newGrid,
                            paths: updatedPaths,
                            activePath: null,
                            completedPairs: updatedCompletedPairs,
                        }));
                        setFirstClickedDotInfo(null); // Reset first click
                        setIsDrawing(false);
                        return; // Path completed by click
                    } else {
                        // Invalid move to connect (e.g., blocked), so this click starts a new selection
                        setFirstClickedDotInfo({ dot: dotWithPairId, cellCoords: coords });
                         if(gameState.activePath && gameState.activePath.id !== dotWithPairId.pairId){ // If an old path was active for a different color
                            const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                            setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                        }
                    }
                } else {
                     // Not adjacent, so this click starts a new selection
                    setFirstClickedDotInfo({ dot: dotWithPairId, cellCoords: coords });
                    if(gameState.activePath && gameState.activePath.id !== dotWithPairId.pairId){
                        const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                        setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                    }
                }
            } else if (dotWithPairId.id === firstClickedDotInfo.dot.id) {
                // Clicked the same dot again: deselect it and clear its active path if any
                setFirstClickedDotInfo(null);
                setIsDrawing(false); // Stop any drawing
                if (gameState.activePath && gameState.activePath.id === dotWithPairId.pairId) {
                    const newGrid = updateGridWithPath(gameState.grid, gameState.activePath, true); // Clear path from grid
                    setGameState(prev => ({
                        ...prev,
                        grid: newGrid,
                        activePath: null, // No active path
                        paths: { // Reset this path in overall paths collection
                            ...prev.paths,
                            [dotWithPairId.pairId]: { ...(prev.paths[dotWithPairId.pairId] || { id: dotWithPairId.pairId, color: dotWithPairId.color, points:[]}), points: [], isComplete: false }
                        }
                    }));
                }
                return;
            } else {
                 // Clicked a different dot: make it the new selection
                setFirstClickedDotInfo({ dot: dotWithPairId, cellCoords: coords });
                 if(gameState.activePath && gameState.activePath.id !== dotWithPairId.pairId){ // Clear old path if it was for a different color
                    const clearedOldPathGrid = updateGridWithPath(gameState.grid, gameState.activePath, true);
                    setGameState(prev => ({...prev, grid: clearedOldPathGrid, activePath: null, paths: {...prev.paths, [gameState.activePath!.id]: {...gameState.activePath!, points:[], isComplete: false}}}));
                 }
            }
        } else {
             // This is the first dot being clicked
            setFirstClickedDotInfo({ dot: dotWithPairId, cellCoords: coords });
        }

        // Common logic for starting a drag path from a selected dot
        if (!gameState.completedPairs.has(dotWithPairId.pairId)) { // Only if pair is not already completed
            let newGrid = gameState.grid;
            const existingPath = gameState.paths[dotWithPairId.pairId];
            
            // Clear any previous incomplete path for this color
            if (existingPath && existingPath.points.length > 0 && !existingPath.isComplete) {
                 newGrid = updateGridWithPath(newGrid, existingPath, true); 
            }

            const newActivePath: DrawnPath = {
                id: dotWithPairId.pairId,
                color: dotWithPairId.color,
                points: [{ x: coords.x, y: coords.y }],
                isComplete: false,
            };
            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(newGrid, newActivePath), // Mark the starting dot cell
                activePath: newActivePath,
                paths: { ...prev.paths, [dotWithPairId.pairId]: newActivePath }, // Store new active path
            }));
            setIsDrawing(true); // Start drawing mode
        }

    } else { // Clicked on an empty cell (not a dot)
        setFirstClickedDotInfo(null); // Clear any dot selection
        setIsDrawing(false); // Ensure not in drawing mode from this action
        // If there was an active path from a previous interaction, clear it
        if (gameState.activePath) {
            const newGrid = updateGridWithPath(gameState.grid, gameState.activePath, true); // Clear path from grid
            setGameState(prev => ({
                ...prev,
                grid: newGrid,
                activePath: null, // No active path
                paths: { // Reset this path in overall paths collection
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

    if (coords.x === lastPoint.x && coords.y === lastPoint.y) return; // No change

    const dx = Math.abs(coords.x - lastPoint.x);
    const dy = Math.abs(coords.y - lastPoint.y);
    if (dx + dy !== 1) return; // Must be an adjacent cell (no diagonals)

    // Check if moving back along the current path (retracing)
    const pointIndexInPath = activePath.points.findIndex(p => p.x === coords.x && p.y === coords.y);
    if (pointIndexInPath !== -1) { // Moved to a point already in the path
      const newPoints = activePath.points.slice(0, pointIndexInPath + 1);
      const clearedPathSegment = { ...activePath, points: activePath.points.slice(pointIndexInPath + 1) };
      
      let newGrid = updateGridWithPath(gameState.grid, clearedPathSegment, true); // Clear the retraced part from grid

      const updatedActivePathForRetrace = { ...activePath, points: newPoints };
      newGrid = updateGridWithPath(newGrid, updatedActivePathForRetrace); // Re-draw up to the new end point

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        activePath: updatedActivePathForRetrace,
        paths: { ...prev.paths, [activePath.id]: updatedActivePathForRetrace },
      }));
      return;
    }

    // Check if moving onto the target dot for completion
    const targetCell = gameState.grid[coords.y][coords.x];
    if (targetCell.isDot && targetCell.dot?.pairId === activePath.id) {
        // If the target dot is the one we are trying to connect to
        const startDotOfActivePath = activePath.points[0];
        if (targetCell.dot.x !== startDotOfActivePath.x || targetCell.dot.y !== startDotOfActivePath.y) {
            // This is the other dot of the pair.
            // Extend path visually to it, actual completion happens on pointerUp
            const newPoints = [...activePath.points, { x: coords.x, y: coords.y }];
            const updatedActivePath = { ...activePath, points: newPoints };
            setGameState(prev => ({
                ...prev,
                grid: updateGridWithPath(prev.grid, updatedActivePath),
                activePath: updatedActivePath,
                paths: { ...prev.paths, [activePath.id]: updatedActivePath },
            }));
            return; // Path extended to target dot
        }
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
    const currentActivePath = gameState.activePath; // Capture before potential state update clears it
    if (showWinModal || hintData.path) return;

    if (!isDrawing || !currentActivePath) {
        setIsDrawing(false); // Ensure drawing mode is off
        // If there was an active path (e.g., from a click) but not drawing,
        // and it wasn't completed, it should be cleared.
        // This might be redundant if click logic already handles it, but good for safety.
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
                 activePath: null, // Clear active path
             }));
        }
        return;
    }

    setIsDrawing(false); // End drawing mode

    const { grid } = gameState;
    const lastPoint = currentActivePath.points[currentActivePath.points.length - 1];
    const targetCell = grid[lastPoint.y][lastPoint.x];

    let updatedPaths = { ...gameState.paths };
    let updatedCompletedPairs = new Set(gameState.completedPairs);
    let finalGrid = grid;

    const startPointOfActivePath = currentActivePath.points[0];
    const isTargetPathValidForCompletion =
        targetCell.isDot &&
        targetCell.dot?.pairId === currentActivePath.id && // Target dot belongs to the active path's pair
        currentActivePath.points.length > 1 && // Path has at least two points (start dot and target dot)
        (targetCell.dot.x !== startPointOfActivePath.x || targetCell.dot.y !== startPointOfActivePath.y); // Target dot is not the start dot

    if (isTargetPathValidForCompletion) {
      // Path successfully connects to the target dot
      const completedPath = { ...currentActivePath, isComplete: true };
      updatedPaths[currentActivePath.id] = completedPath;
      updatedCompletedPairs.add(currentActivePath.id);
      finalGrid = updateGridWithPath(grid, completedPath); // Ensure grid reflects completed path
      setFirstClickedDotInfo(null); // Clear any first click selection
    } else {
      // Path did not end on a valid target dot, so clear it
      finalGrid = updateGridWithPath(grid, currentActivePath, true); // Clear the drawn path from the grid
      updatedPaths[currentActivePath.id] = { ...currentActivePath, points: [], isComplete: false }; // Reset path in paths collection
      
      // If the path was more than just the starting dot, it was an invalid drag, clear selection.
      // If it was just the starting dot (from a click that didn't become a drag), keep selection.
      if (currentActivePath.points.length > 1) {
          setFirstClickedDotInfo(null);
      }
    }

    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      paths: updatedPaths,
      activePath: null, // Path is either completed or cleared, so no longer active
      completedPairs: updatedCompletedPairs,
    }));
  };

  useEffect(() => {
    // Check for win condition only if not currently drawing, no hint is active, no modal is shown,
    // and there's no pending first click (to avoid premature win checks during click-connect).
    if (!isDrawing && !gameState.activePath && !firstClickedDotInfo && !showWinModal && !hintData.path) {
        const puzzleIsWon = checkWinCondition(gameState, puzzle);
        if (puzzleIsWon) {
            markLevelAsCompleted(puzzle.difficulty, puzzle.id);
            onLevelComplete(); // Callback to parent (e.g., to potentially navigate)
            setShowWinModal(true); // Show the win modal
        }
    }
  // Note: firstClickedDotInfo is part of the dependency array to re-evaluate if a click interaction finalized.
  }, [gameState, puzzle, onLevelComplete, isDrawing, firstClickedDotInfo, showWinModal, hintData.path]);


  const handleHint = () => {
    if (remainingHints <= 0 || hintData.path || showWinModal || allPairsCompleted) return;

    const incompleteFlows = puzzle.flows.filter(
      flow => !gameState.completedPairs.has(flow.pairId)
    );

    if (incompleteFlows.length === 0) {
      return; // All flows (pairs) are already completed
    }

    setRemainingHints(prev => prev - 1);

    const randomFlowIndex = Math.floor(Math.random() * incompleteFlows.length);
    const flowToHint = incompleteFlows[randomFlowIndex];

    if (!flowToHint.solutionPath || flowToHint.solutionPath.length < 2) {
      console.error("Selected flow for hint has no valid solution path in puzzle data.");
      setRemainingHints(prev => prev + 1); // Restore hint as it couldn't be used
      return;
    }

    // If there's an active path for the flow we are about to hint, clear it from the game state first
    if (gameState.activePath && gameState.activePath.id === flowToHint.pairId) {
        const gridWithClearedActivePath = updateGridWithPath(gameState.grid, gameState.activePath, true);
        const updatedPathsForClear = {
            ...gameState.paths,
            [gameState.activePath.id]: { ...gameState.activePath, points: [], isComplete: false }
        };
        setGameState(prev => ({
            ...prev,
            grid: gridWithClearedActivePath,
            paths: updatedPathsForClear,
            activePath: null,
        }));
    } else if (gameState.paths[flowToHint.pairId]?.points.length > 0 && !gameState.paths[flowToHint.pairId]?.isComplete) {
        // If there's an existing, incomplete path for this flow (but not currently activePath), clear it
        const gridWithClearedExistingPath = updateGridWithPath(gameState.grid, gameState.paths[flowToHint.pairId], true);
        const updatedPathsForClear = {
            ...gameState.paths,
            [flowToHint.pairId]: { ...gameState.paths[flowToHint.pairId], points: [], isComplete: false }
        };
         setGameState(prev => ({
            ...prev,
            grid: gridWithClearedExistingPath,
            paths: updatedPathsForClear,
        }));
    }


    setHintData({
      path: { // This is a temporary path for display, not affecting game state's 'paths'
        id: flowToHint.pairId,
        color: flowToHint.color,
        points: flowToHint.solutionPath, // Use the pre-defined solution path
        isComplete: false, // It's just a visual hint
      },
      visiblePoints: [], // Start with no points visible for animation
    });
  };

  useEffect(() => {
    let animationTimer: NodeJS.Timeout | undefined;
    let hideTimer: NodeJS.Timeout | undefined;

    if (hintData.path && hintData.visiblePoints.length < hintData.path.points.length) {
      const pointsToAnimate = hintData.path.points;
      const currentVisibleCount = hintData.visiblePoints.length;

      if (pointsToAnimate.length <= 1) { // Path too short, show immediately
        setHintData(prev => ({ ...prev, visiblePoints: pointsToAnimate }));
        return;
      }
      
      if (currentVisibleCount === 0) { // Start with the first point
         setHintData(prev => ({ ...prev, visiblePoints: [pointsToAnimate[0]] }));
      } else {
        const numberOfSegments = pointsToAnimate.length -1; // Total segments to draw
        const delayPerSegment = HINT_ANIMATION_DURATION / numberOfSegments;

        animationTimer = setTimeout(() => {
          setHintData(prev => {
            if (!prev.path) return prev; // Path might have been cleared
            const nextPointIndex = prev.visiblePoints.length;
            if (nextPointIndex < prev.path.points.length) {
              const nextPoint = prev.path.points[nextPointIndex];
              return { ...prev, visiblePoints: [...prev.visiblePoints, nextPoint] };
            }
            return prev; // All points shown
          });
        }, delayPerSegment);
      }
    } else if (hintData.path && hintData.visiblePoints.length > 0 && hintData.visiblePoints.length === hintData.path.points.length) {
      // All points of the hint are visible, set timer to hide it
      hideTimer = setTimeout(() => {
        setHintData({ path: null, visiblePoints: [] }); // Clear hint
      }, HINT_VISIBLE_DURATION);
    }

    return () => {
      if (animationTimer) clearTimeout(animationTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [hintData]);


  const allPairsCompleted = puzzle.flows.every(flow => gameState.completedPairs.has(flow.pairId));

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
          onMouseLeave={handlePointerUp} // Treat mouse leave as pointer up to finalize or clear path
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

          {/* Active path being drawn (from gameState.activePath) */}
          {gameState.activePath && gameState.activePath.points.length > 0 && (
             <polyline
                key={`${gameState.activePath.id}-active`}
                points={gameState.activePath.points.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                fill="none"
                stroke={gameState.activePath.color}
                strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50" // Slightly transparent for active drawing
              />
          )}

          {/* Animated Hint Path (from hintData) */}
          {hintData.path && hintData.visiblePoints.length > 0 && (
            <polyline
              key="hint-path-animation"
              points={hintData.visiblePoints.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
              fill="none"
              stroke={hintData.path.color} // Use hint path's color
              strokeWidth={CELL_SIZE * LINE_WIDTH_PERCENT * 0.7} // Slightly thinner
              strokeDasharray="3 3" // Dashed line for hint
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none opacity-90" // Ensure it doesn't block interactions
            />
          )}


          {/* Dots */}
          {puzzle.flows.flatMap(flow => flow.dots).map(dot => (
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
                  "opacity-30": hintData.path && hintData.path.id !== puzzle.flows.find(f => f.dots.some(d => d.id === dot.id))?.pairId,
                  "opacity-100": hintData.path && hintData.path.id === puzzle.flows.find(f => f.dots.some(d => d.id === dot.id))?.pairId,
                  
                  // Styling when no hint is active
                  "ring-2 ring-offset-2 ring-foreground dark:ring-offset-background":
                    !hintData.path && firstClickedDotInfo?.dot.id === dot.id,
                  "opacity-60": // Dim completed dots when no hint is active
                    !hintData.path &&
                    gameState.completedPairs.has(puzzle.flows.find(f => f.dots.some(d => d.id === dot.id))!.pairId) &&
                    !(firstClickedDotInfo?.dot.id === dot.id)
                }
              )}
              data-dot-id={dot.id} // For debugging or potential specific targeting
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
