
'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import GameBoard from '@/components/game-board';
import { getPuzzle, MAX_LEVELS } from '@/lib/puzzles-data';
import type { Difficulty, PuzzleData } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
// Link component is not used directly for navigation that needs confirmation
// import Link from 'next/link'; 
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import ConfirmExitModal from '@/components/confirm-exit-modal';
import { useIsMobile } from '@/hooks/use-mobile'; // For responsive button

export default function PlayLevelPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname(); // Keep pathname for other potential uses if any
  const isMobile = useIsMobile();

  const difficulty = useMemo(() => params.difficulty as Difficulty, [params.difficulty]);
  const levelId = useMemo(() => parseInt(params.levelId as string, 10), [params.levelId]);

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  // isNavigationAllowed helps ensure that when we programmatically navigate after confirmation,
  // any future interception logic (if added) doesn't re-trigger.
  const [isNavigationAllowed, setIsNavigationAllowed] = useState(false); 

  useEffect(() => {
    if (difficulty && !isNaN(levelId)) {
      setIsLoading(true);
      const currentPuzzle = getPuzzle(difficulty, levelId);
      if (currentPuzzle) {
        setPuzzle(currentPuzzle);
      } else {
        // If puzzle not found, redirect to the level selection for that difficulty
        router.replace(`/levels/${difficulty}`);
      }
      setIsLoading(false);
    }
  }, [difficulty, levelId, router]);

  // Removed the useEffect block that used router.events, as it's not compatible with App Router
  // and was causing the runtime error.
  // Confirmation for "Back to Levels" is handled by its onClick handler.
  // Confirmation for other navigation (e.g., header Home, browser back) is not implemented here
  // to avoid complexity with App Router's navigation handling without router.events.

  const handleLevelComplete = () => {
    // This will be handled by the WinModal and progress saving logic
    console.log(`Level ${levelId} in ${difficulty} completed!`);
  };

  const handleNextLevel = () => {
    const nextLevelId = levelId + 1;
    const totalLevels = MAX_LEVELS[difficulty] || 0;
    setIsNavigationAllowed(true); // Allow this navigation
    if (nextLevelId < totalLevels) {
      router.push(`/play/${difficulty}/${nextLevelId}`);
    } else {
      router.push(`/levels/${difficulty}?allCompleted=true`);
    }
  };

  const confirmAndNavigate = () => {
    if (nextRoute) {
      setIsNavigationAllowed(true);
      router.push(nextRoute);
    }
    setIsConfirmModalOpen(false);
    setNextRoute(null);
  };

  const cancelNavigation = () => {
    setIsConfirmModalOpen(false);
    setNextRoute(null);
    setIsNavigationAllowed(false); // Ensure it's reset
  };

  const handleBackToLevelsClick = () => {
    // Instead of navigating directly, set up the modal
    setNextRoute(`/levels/${difficulty}`);
    setIsConfirmModalOpen(true);
  };
  
  if (isLoading || !puzzle) {
    return <LoadingSpinner message="Loading puzzle..." />;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-3xl flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleBackToLevelsClick} // This now opens the modal
          size={isMobile ? "icon" : "default"}
          aria-label="Back to Levels"
          className="md:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline md:ml-2">Back to Levels</span>
        </Button>
        {/* The Home button here was removed previously, GameHeader provides the main Home button */}
      </div>
      <GameBoard 
        puzzle={puzzle} 
        onLevelComplete={handleLevelComplete}
        onNextLevel={handleNextLevel}
        currentLevelIndex={levelId}
        totalLevelsInDifficulty={MAX_LEVELS[difficulty] || 0}
      />
      <ConfirmExitModal
        isOpen={isConfirmModalOpen}
        onConfirm={confirmAndNavigate}
        onCancel={cancelNavigation}
      />
    </div>
  );
}
