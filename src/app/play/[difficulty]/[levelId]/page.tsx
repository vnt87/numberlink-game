'use client'; // Required for useRouter and useState/useEffect

import { useParams, useRouter } from 'next/navigation';
import GameBoard from '@/components/game-board';
import { getPuzzle, MAX_LEVELS } from '@/lib/puzzles-data';
import type { Difficulty, PuzzleData } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';

export default function PlayLevelPage() {
  const router = useRouter();
  const params = useParams();
  
  const difficulty = params.difficulty as Difficulty;
  const levelId = parseInt(params.levelId as string, 10);

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (difficulty && !isNaN(levelId)) {
      setIsLoading(true);
      const currentPuzzle = getPuzzle(difficulty, levelId);
      if (currentPuzzle) {
        setPuzzle(currentPuzzle);
      } else {
        // Handle puzzle not found, e.g., redirect or show error
        router.replace(`/levels/${difficulty}`); // Or a 404 page
      }
      setIsLoading(false);
    }
  }, [difficulty, levelId, router]);

  const handleLevelComplete = () => {
    // This will be handled by the WinModal and progress saving logic
    // The WinModal's Next Level button will navigate
    console.log(`Level ${levelId} in ${difficulty} completed!`);
  };

  const handleNextLevel = () => {
    const nextLevelId = levelId + 1;
    const totalLevels = MAX_LEVELS[difficulty] || 0;
    if (nextLevelId < totalLevels) {
      router.push(`/play/${difficulty}/${nextLevelId}`);
    } else {
      // Last level of difficulty completed, maybe navigate to difficulty selection
      router.push(`/levels/${difficulty}?allCompleted=true`);
    }
  };
  
  if (isLoading || !puzzle) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-3xl flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={`/levels/${difficulty}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Levels
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Home">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <GameBoard 
        puzzle={puzzle} 
        onLevelComplete={handleLevelComplete}
        onNextLevel={handleNextLevel}
        currentLevelIndex={levelId}
        totalLevelsInDifficulty={MAX_LEVELS[difficulty] || 0}
      />
    </div>
  );
}
