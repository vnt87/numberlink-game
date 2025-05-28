import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          Connectify
        </Link>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Home">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
