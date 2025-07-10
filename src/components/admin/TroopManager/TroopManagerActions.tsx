import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TroopManagerActionsProps {
  selectedTroopsCount: number;
  loading: boolean;
  onAddSelectedTroops: () => void;
  onCancel: () => void;
}

export function TroopManagerActions({ 
  selectedTroopsCount, 
  loading, 
  onAddSelectedTroops, 
  onCancel 
}: TroopManagerActionsProps) {
  return (
    <div className="flex gap-4 pt-6 border-t">
      <Button
        onClick={onAddSelectedTroops}
        disabled={loading || selectedTroopsCount === 0}
        className="flex-1 bg-gradient-primary hover:bg-gradient-winner text-accent-foreground font-game-title text-lg py-3"
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            Saving Changes...
          </>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            💾 Save & Update Counter Advice ({selectedTroopsCount})
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="font-game-title"
        disabled={loading}
      >
        Cancel
      </Button>
    </div>
  );
}