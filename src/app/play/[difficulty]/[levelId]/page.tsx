
'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import GameBoard from '@/components/game-board';
import { getPuzzle, MAX_LEVELS } from '@/lib/puzzles-data';
import type { Difficulty, PuzzleData } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Keep Link for cases where direct navigation is okay or as a fallback.
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import ConfirmExitModal from '@/components/confirm-exit-modal';
import { useIsMobile } from '@/hooks/use-mobile'; // For responsive button

export default function PlayLevelPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const difficulty = useMemo(() => params.difficulty as Difficulty, [params.difficulty]);
  const levelId = useMemo(() => parseInt(params.levelId as string, 10), [params.levelId]);

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  const [isNavigationAllowed, setIsNavigationAllowed] = useState(false);

  useEffect(() => {
    if (difficulty && !isNaN(levelId)) {
      setIsLoading(true);
      const currentPuzzle = getPuzzle(difficulty, levelId);
      if (currentPuzzle) {
        setPuzzle(currentPuzzle);
      } else {
        router.replace(`/levels/${difficulty}`);
      }
      setIsLoading(false);
    }
  }, [difficulty, levelId, router]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (isNavigationAllowed) {
        setIsNavigationAllowed(false); // Reset for the next user-initiated navigation
        return;
      }

      // Only intercept if currently on a play page and navigating to a different URL
      const isCurrentlyOnPlayPage = pathname.startsWith(`/play/${difficulty}/${levelId}`);
      const isNavigatingAway = url !== pathname && !url.startsWith(pathname); // Basic check

      if (isCurrentlyOnPlayPage && isNavigatingAway) {
        // Prevent ShadCN dialogs from closing if a route change error is emitted.
        // This helps keep the modal open.
        document.body.setAttribute('data-scroll-locked-by-router', 'true');
        
        router.events.emit('routeChangeError');
        setNextRoute(url);
        setIsConfirmModalOpen(true);
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'Navigation cancelled by user confirmation.';
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      document.body.removeAttribute('data-scroll-locked-by-router');
    };
  }, [router, difficulty, levelId, isNavigationAllowed, pathname]);

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
    document.body.removeAttribute('data-scroll-locked-by-router');
  };

  const cancelNavigation = () => {
    setIsConfirmModalOpen(false);
    setNextRoute(null);
    setIsNavigationAllowed(false); // Ensure it's reset
    document.body.removeAttribute('data-scroll-locked-by-router');
  };

  const handleBackToLevelsClick = () => {
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
          onClick={handleBackToLevelsClick}
          size={isMobile ? "icon" : "default"}
          aria-label="Back to Levels"
          className="md:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline md:ml-2">Back to Levels</span>
        </Button>
        {/* The Home button here was removed, GameHeader provides the main Home button */}
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
