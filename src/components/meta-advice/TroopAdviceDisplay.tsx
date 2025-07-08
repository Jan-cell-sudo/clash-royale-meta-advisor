import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TrendingDown } from "lucide-react";
import { troopElixirCosts, troopTraitFamilies } from "../stats/constants";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { TroopImage } from "./TroopImage";

interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  usageCount: number;
  traitFamily: string;
  rank: number;
}

interface TroopAdviceDisplayProps {
  troops: TroopAdvice[];
  loading: boolean;
  editMode: boolean;
  isAdmin: boolean;
  selectedLeague: string;
  onCountChange: (index: number, newCount: string) => void;
  onPercentageChange: (index: number, newPercentage: string) => void;
}

export function TroopAdviceDisplay({
  troops,
  loading,
  editMode,
  isAdmin,
  selectedLeague,
  onCountChange,
  onPercentageChange
}: TroopAdviceDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-silver border-2 border-accent/50">
            <div className="h-12 w-12 rounded-xl bg-muted animate-pulse border-2 border-accent" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (troops.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingDown className="h-16 w-16 text-foreground/60 mx-auto mb-6 animate-bounce-subtle" strokeWidth={3} />
        <p className="text-foreground font-game-title text-xl mb-3">No data available for this league yet.</p>
        <p className="text-lg font-game text-foreground/80">Upload screenshots to help build the meta database!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-t-2 border-accent/30 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="h-6 w-6 animate-bounce-subtle text-accent-foreground" strokeWidth={3} />
          <h3 className="font-game-title text-xl text-accent-foreground drop-shadow-lg">
            Meta Counter Advice
          </h3>
        </div>
        <p className="font-game text-accent-foreground/80 mb-6">
          Least used troops in <Badge variant="secondary" className="bg-gradient-silver text-foreground font-game-title border-2 border-accent mx-1">{selectedLeague}</Badge> - Use these to gain advantage! (Low → High usage)
        </p>
      </div>

      <div className="space-y-4">
        {troops.map((troop, index) => (
          <div key={troop.id} className={`flex items-center space-x-6 p-6 rounded-xl border-3 shadow-game transition-all duration-200 hover:scale-105 ${
            index === 0 ? 'bg-gradient-winner border-accent' : 'bg-gradient-silver border-accent/70'
          }`}>
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-game-inset flex-shrink-0">
              <TroopImage 
                troopName={troop.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editMode && isAdmin && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-game text-card-foreground/70">Count:</label>
                        <Input
                          type="number"
                          value={troop.usageCount}
                          onChange={(e) => onCountChange(index, e.target.value)}
                          className="w-24 h-9 text-sm font-game-title"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-game text-card-foreground/70">Percentage:</label>
                        <Input
                          type="number"
                          value={troop.usagePercentage.toFixed(1)}
                          onChange={(e) => onPercentageChange(index, e.target.value)}
                          className="w-24 h-9 text-sm font-game-title"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm font-game-title text-accent">%</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <Badge 
                    variant="outline" 
                    className={`text-lg font-game-title border-3 mb-3 px-4 py-2 ${
                      index === 0 ? 'border-accent bg-accent text-accent-foreground' : 'border-foreground bg-transparent text-foreground'
                    }`}
                  >
                    #{troop.rank}
                  </Badge>
                  <div className="text-5xl font-game-title text-accent drop-shadow-lg mb-2">
                    {troop.usagePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <Progress 
                value={troop.usagePercentage} 
                className="h-5 border-3 border-accent bg-gradient-primary shadow-game"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}