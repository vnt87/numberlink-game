import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Gem } from 'lucide-react'; // Icons for difficulty levels
import type { Difficulty } from '@/types';

const difficultyLevels: { name: Difficulty; title: string; description: string; icon: React.ElementType }[] = [
  { name: 'easy', title: 'Easy Breezy', description: 'Perfect for beginners. Relax and enjoy!', icon: Zap },
  { name: 'medium', title: 'Medium Challenge', description: 'Test your skills with trickier puzzles.', icon: Brain },
  { name: 'hard', title: 'Hardcore Flow', description: 'Only for the puzzle masters. Good luck!', icon: Gem },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary">Welcome to StretchyKats!</h1>
        <p className="text-muted-foreground mt-2 text-lg">Connect the dots, fill the board, and solve the puzzles.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
        {difficultyLevels.map((level) => (
          <Card key={level.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="items-center text-center">
              <level.icon className="w-12 h-12 text-primary mb-2" />
              <CardTitle className="text-2xl">{level.title}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" className="w-full">
                <Link href={`/levels/${level.name}`}>Play {level.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="mt-8 p-6 bg-card rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-center mb-4">How to Play</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Select a difficulty and then choose a puzzle.</li>
          <li>Click or tap on a colored dot to start drawing a line.</li>
          <li>Drag the line to the matching colored dot.</li>
          <li>Lines cannot cross each other.</li>
          <li>Fill the entire board with lines to complete the puzzle!</li>
        </ul>
      </div>
    </div>
  );
}
