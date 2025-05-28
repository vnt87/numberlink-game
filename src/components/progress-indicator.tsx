"use client";

import type { Difficulty } from "@/types";
import { useEffect, useState } from "react";
import { MAX_LEVELS } from "@/lib/puzzles-data";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  difficulty: Difficulty;
}

export function ProgressIndicator({ difficulty }: ProgressIndicatorProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const totalLevels = MAX_LEVELS[difficulty] || 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = JSON.parse(localStorage.getItem(`connectify-progress-${difficulty}`) || '[]') as number[];
      setCompletedCount(completed.length);

      const handleStorageChange = () => {
        const updatedCompleted = JSON.parse(localStorage.getItem(`connectify-progress-${difficulty}`) || '[]') as number[];
        setCompletedCount(updatedCompleted.length);
      };
      
      window.addEventListener('storage', handleStorageChange); // Listen for changes from other tabs
      // Custom event for same-tab updates
      window.addEventListener(`progressUpdate-${difficulty}`, handleStorageChange);


      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener(`progressUpdate-${difficulty}`, handleStorageChange);
      };
    }
  }, [difficulty]);

  const progressPercentage = totalLevels > 0 ? (completedCount / totalLevels) * 100 : 0;

  return (
    <div className="w-full max-w-md mb-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Progress</span>
        <span>{completedCount} / {totalLevels}</span>
      </div>
      <Progress value={progressPercentage} aria-label={`${difficulty} level completion progress`} className="h-3 [&>div]:bg-primary" />
    </div>
  );
}
