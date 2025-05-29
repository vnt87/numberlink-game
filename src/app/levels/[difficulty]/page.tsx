
"use client";

import Link from 'next/link';
import { puzzles, MAX_LEVELS } from '@/lib/puzzles-data';
import type { Difficulty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { ProgressIndicator } from '@/components/progress-indicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, use } from 'react'; // Import use from React

// Interface for the actual shape of parameters once resolved from the URL
interface PageResolvedParams {
  difficulty: string; // Route params are initially strings
}

// Props for the Page component. Next.js passes `params` as a Promise here.
interface LevelSelectPageProps {
  params: Promise<PageResolvedParams>;
}

export default function LevelSelectPage({ params: paramsPromise }: LevelSelectPageProps) {
  // Unwrap the Promise to get the actual params object
  // React.use() will suspend if the promise is not yet resolved.
  const resolvedParams = use(paramsPromise);
  // Cast the string 'difficulty' from params to our Difficulty union type
  const difficulty = resolvedParams.difficulty as Difficulty;

  const isMobile = useIsMobile();

  const levelsForDifficulty = puzzles[difficulty] || [];
  const totalLevels = MAX_LEVELS[difficulty] || 0;

  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    // localStorage is only available on the client
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem(`stretchykats-progress-${difficulty}`);
      setCompletedLevels(storedProgress ? JSON.parse(storedProgress) : []);
    }
  }, [difficulty]);


  if (levelsForDifficulty.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">No levels found for {difficulty}</h1>
        <Button asChild size={isMobile ? "icon" : "default"} aria-label="Back to Home" className={isMobile ? "" : "md:w-auto"}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline md:ml-2">Back to Home</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <Button variant="outline" asChild size={isMobile ? "icon" : "default"} aria-label="Back to Difficulties" className={isMobile ? "" : "md:w-auto"}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline md:ml-2">Back to Difficulties</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary capitalize">{difficulty} Levels</h1>
        <div className={isMobile ? "w-10" : "w-40 md:w-auto"}> {/* Adjusted spacer for better mobile layout */} </div>
      </div>
      
      <ProgressIndicator difficulty={difficulty} />

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full max-w-4xl">
        {Array.from({ length: totalLevels }, (_, i) => {
          const level = levelsForDifficulty.find(l => l.id === i);
          const isCompleted = completedLevels.includes(i);
          // For now, all levels are unlocked.
          const isLocked = false; 

          return (
            <Card
              key={i}
              className={`aspect-square flex flex-col items-center justify-center transition-all duration-150 ease-in-out group
                ${isLocked ? 'bg-muted opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105 hover:border-primary'}
                ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700' : ''}
              `}
            >
              <Link href={!isLocked ? `/play/${difficulty}/${i}` : '#'} className="w-full h-full flex flex-col items-center justify-center p-1">
                <CardHeader className="p-1 sm:p-2 flex-grow flex items-center justify-center">
                  {isLocked ? (
                    <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  ) : (
                    <CardTitle className="text-2xl sm:text-3xl font-bold group-hover:text-primary">
                      {i + 1}
                    </CardTitle>
                  )}
                </CardHeader>
                {isCompleted && !isLocked && (
                  <CardContent className="p-0 sm:p-1">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-500" />
                  </CardContent>
                )}
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    