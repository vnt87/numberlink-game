
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Difficulty } from '@/types';

const difficultyLevels: { name: Difficulty; title: string }[] = [
  { name: 'easy', title: 'Easy' },
  { name: 'medium', title: 'Medium' },
  { name: 'hard', title: 'Hard' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-8">StretchyKats</h1>
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Select Difficulty</h2>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
        {difficultyLevels.map((level) => (
          <Button key={level.name} asChild size="lg" className="w-full">
            <Link href={`/levels/${level.name}`}>{level.title}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
