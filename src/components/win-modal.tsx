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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <PartyPopper className="w-16 h-16 text-accent mb-4" />
          <AlertDialogTitle className="text-2xl">Level Complete!</AlertDialogTitle>
          <AlertDialogDescription>
            Congratulations, you've successfully connected all the dots!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
          <Button variant="outline" onClick={onReplay} className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Replay
          </Button>
          {hasNextLevel ? (
            <AlertDialogAction onClick={onNextLevel} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <ArrowRightCircle className="mr-2 h-4 w-4" /> Next Level
            </AlertDialogAction>
          ) : (
            <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
