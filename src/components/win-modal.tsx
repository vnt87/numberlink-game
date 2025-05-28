
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, RotateCcw, ArrowRightCircle } from "lucide-react";

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onReplay: () => void;
  currentLevelIndex: number;
  totalLevelsInDifficulty: number;
}

export default function WinModal({ 
  isOpen, 
  onClose, 
  onNextLevel, 
  onReplay,
  currentLevelIndex,
  totalLevelsInDifficulty 
}: WinModalProps) {
  if (!isOpen) return null;

  const hasNextLevel = currentLevelIndex < totalLevelsInDifficulty - 1;

  const handleReplayClick = () => {
    onReplay();
    onClose(); 
  };

  const handleNextLevelClick = () => {
    onNextLevel();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <PartyPopper className="w-16 h-16 text-yellow-400 mb-4" /> {/* Changed to yellow for more pop */}
          <AlertDialogTitle className="text-2xl font-bold text-primary">Level Complete!</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Congratulations, you've successfully connected all the dots!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-4">
          <Button variant="outline" onClick={handleReplayClick} className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Replay
          </Button>
          {hasNextLevel ? (
            <Button onClick={handleNextLevelClick} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowRightCircle className="mr-2 h-4 w-4" /> Next Level
            </Button>
          ) : (
            <Button onClick={onClose} className="w-full sm:w-auto">
              All Levels Done!
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
