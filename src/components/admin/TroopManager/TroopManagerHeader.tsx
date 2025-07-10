import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface TroopManagerHeaderProps {
  selectedLeague: string;
  onClose: () => void;
}

export function TroopManagerHeader({ selectedLeague, onClose }: TroopManagerHeaderProps) {
  return (
    <CardHeader style={{
      background: 'var(--gradient-winner)',
      borderBottom: '4px solid hsl(var(--accent))'
    }}>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground">
          <Plus className="h-6 w-6" />
          Add to {selectedLeague} Counter Advice
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-accent-foreground hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}