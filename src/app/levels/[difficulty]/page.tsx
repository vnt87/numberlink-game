import Link from 'next/link';
import { puzzles, MAX_LEVELS } from '@/lib/puzzles-data';
import type { Difficulty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { ProgressIndicator } from '@/components/progress-indicator'; // Placeholder for actual progress loading

interface LevelPageProps {
  params: {
    difficulty: Difficulty;
  };
}

export default function LevelSelectPage({ params }: LevelPageProps) {
  const { difficulty } = params;
  const levelsForDifficulty = puzzles[difficulty] || [];
  const totalLevels = MAX_LEVELS[difficulty] || 0;

  // Placeholder for completed levels - in a real app, this would come from localStorage/context
  const completedLevels: number[] = typeof window !== 'undefined' ? 
    JSON.parse(localStorage.getItem(`connectify-progress-${difficulty}`) || '[]') : [];


  if (levelsForDifficulty.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">No levels found for {difficulty}</h1>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Difficulties
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary capitalize">{difficulty} Levels</h1>
        <div className="w-24"> {/* Spacer */} </div>
      </div>
      
      <ProgressIndicator difficulty={difficulty} />

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full max-w-4xl">
        {Array.from({ length: totalLevels }, (_, i) => {
          const level = levelsForDifficulty.find(l => l.id === i);
          const isCompleted = completedLevels.includes(i);
          // For now, all levels are unlocked.
          // const isLocked = i > 0 && !completedLevels.includes(i - 1); // Example locking logic
          const isLocked = false; 

          return (
            <Card
              key={i}
              className={`aspect-square flex flex-col items-center justify-center transition-all duration-150 ease-in-out
                ${isLocked ? 'bg-muted opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105 hover:border-primary'}
                ${isCompleted ? 'border-green-500 bg-green-50' : ''}
              `}
            >
              <Link href={!isLocked ? `/play/${difficulty}/${i}` : '#'} className="w-full h-full flex flex-col items-center justify-center">
                <CardHeader className="p-2 flex-grow flex items-center justify-center">
                  {isLocked ? (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <CardTitle className="text-3xl font-bold group-hover:text-primary">
                      {i + 1}
                    </CardTitle>
                  )}
                </CardHeader>
                {isCompleted && !isLocked && (
                  <CardContent className="p-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
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
