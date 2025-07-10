import { Check } from "lucide-react";

interface TroopManagerEmptyStateProps {
  selectedLeague: string;
}

export function TroopManagerEmptyState({ selectedLeague }: TroopManagerEmptyStateProps) {
  return (
    <div className="text-center py-8">
      <Check className="h-16 w-16 text-foreground/60 mx-auto mb-4" />
      <p className="text-foreground font-game-title">All troops are already in the advice!</p>
      <p className="text-sm text-foreground/70 font-game">All available troops are already being recommended for {selectedLeague}.</p>
    </div>
  );
}